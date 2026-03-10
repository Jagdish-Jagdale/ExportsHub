/**
 * ExportsHub IMAP Reader
 * Fetches emails from Gmail via IMAP and syncs them to Firestore `replies` collection.
 * Run: node imap-reader.js
 * Watch mode: node imap-reader.js --watch
 */

require('dotenv').config();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ─── Firebase Admin Init ─────────────────────────────────────────────────────
const serviceAccountPath = path.resolve(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
);

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
    console.error('   Please download it from Firebase Console → Project Settings → Service Accounts');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// ─── Config ──────────────────────────────────────────────────────────────────
const GMAIL_USER = process.env.GMAIL_USER || 'printfhelloworld99@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '60000', 10);
const FETCH_LIMIT = parseInt(process.env.FETCH_LIMIT || '50', 10);
const WATCH_MODE = process.argv.includes('--watch');

// ─── Subject Filter ───────────────────────────────────────────────────────────
// Only save emails whose subject contains this keyword (case-insensitive)
// Matches: "Re: Quotation ID(#IKXP9EEC) - ExportsHub", "Quotation ID(#XYZ) - ExportsHub", etc.
const SUBJECT_FILTER = 'exportshub';

if (!GMAIL_APP_PASSWORD) {
    console.error('❌ GMAIL_APP_PASSWORD is not set in .env');
    console.error('   Get one at: https://myaccount.google.com/apppasswords');
    process.exit(1);
}

// ─── IMAP Config ─────────────────────────────────────────────────────────────
const imapConfig = {
    user: GMAIL_USER,
    password: GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a raw email buffer using mailparser
 */
function parseEmail(buffer) {
    return new Promise((resolve, reject) => {
        simpleParser(buffer, (err, parsed) => {
            if (err) reject(err);
            else resolve(parsed);
        });
    });
}

/**
 * Fetch the latest `limit` emails using an *existing* imap connection
 */
function fetchLatestEmails(imap, box, limit) {
    return new Promise((resolve, reject) => {
        const totalMessages = box.messages.total;
        if (totalMessages === 0) return resolve([]);

        const start = Math.max(1, totalMessages - limit + 1);
        const fetchRange = `${start}:${totalMessages}`;

        const fetch = imap.seq.fetch(fetchRange, { bodies: '', struct: true, envelope: true });
        let expected = totalMessages - start + 1;
        let received = 0;
        const emails = [];

        fetch.on('message', (msg, seqno) => {
            console.log(`   ⏳ Fetching seqno ${seqno}...`);
            let buffer = '';
            let uid = null;
            msg.on('body', (stream) => stream.on('data', (chunk) => buffer += chunk.toString('utf8')));
            msg.once('attributes', (attrs) => uid = attrs.uid);
            msg.once('end', () => {
                console.log(`   📦 Finished fetching seqno ${seqno}`);
                emails.push({ buffer, uid, seqno });
                received++;
                if (received === expected) {
                    console.log(`   🏁 All ${expected} messages received.`);
                }
            });
        });

        fetch.once('error', (err) => {
            console.error('   ❌ Fetch Error:', err);
            reject(err);
        });
        fetch.once('end', () => {
            console.log(`   📶 Fetch request ended. Total processed: ${emails.length}`);
            resolve(emails);
        });
    });
}

/**
 * Save a new email to Firestore `replies` collection (deduplicated by messageId)
 */
async function saveEmailToFirestore(parsed, uid) {
    const colRef = db.collection('replies');

    // Use globally unique Message-ID for deduplication (fallback to uid if missing)
    const messageId = parsed.messageId || `uid-${uid}`;

    // Deduplication: check if this messageId already exists
    const existing = await colRef.where('messageId', '==', messageId).limit(1).get();
    if (!existing.empty) {
        return false; // already saved
    }

    const fromAddress = parsed.from?.value?.[0];
    const fromEmail = fromAddress?.address || 'unknown@unknown.com';
    const fromName = fromAddress?.name || fromEmail;

    const subject = parsed.subject || '(No Subject)';
    const message = parsed.text || parsed.html?.replace(/<[^>]+>/g, '') || '(No Content)';
    const receivedAt = parsed.date ? admin.firestore.Timestamp.fromDate(new Date(parsed.date)) : admin.firestore.Timestamp.now();

    await colRef.add({
        uid,
        messageId,
        fromEmail,
        fromName,
        subject,
        message: message.trim().slice(0, 5000), // cap at 5k chars
        createdAt: receivedAt,
        status: 'Pending',
        source: 'imap',
    });

    return true;
}

/**
 * Process raw emails, parse them, and save to Firestore
 */
async function processEmails(rawEmails) {
    let saved = 0;
    let skipped = 0;

    for (const { buffer, uid, seqno } of rawEmails) {
        try {
            const parsed = await parseEmail(buffer);

            // ── No subject filter: save all emails in this dedicated inbox ──
            const subject = (parsed.subject || '');
            const isQuotation = true; // allow all

            if (!isQuotation) {
                skipped++;
                continue; // skip emails that don't match the specific quotation format
            }

            console.log(`   📩 Processing: "${parsed.subject}"`);
            const isNew = await saveEmailToFirestore(parsed, uid);
            if (isNew) {
                saved++;
                console.log(`   ✅ Saved: [${uid}] "${parsed.subject || '(No Subject)'}" from ${parsed.from?.text}`);
            } else {
                skipped++;
            }
        } catch (parseErr) {
            console.warn(`   ⚠️  Could not parse email seqno=${seqno}: ${parseErr.message}`);
        }
    }

    if (saved > 0 || skipped > 0) {
        console.log(`   📊 Processed: ${saved} new, ${skipped} already synced/ignored`);
    }
}

// ─── Entry Point (Persistent Connection with IDLE) ───────────────────────────
(async function startImap() {
    try {
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ExportsHub IMAP Reader (REAL-TIME)     ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log(`📧 Account  : ${GMAIL_USER}`);
        console.log(`🔥 Firestore: replies collection`);

        const imap = new Imap(imapConfig);

        imap.once('ready', () => {
            console.log('🔗 Connected to Gmail IMAP securely.');
            imap.openBox('[Gmail]/All Mail', true, async (err, box) => {
                try {
                    if (err) throw err;
                    console.log('📂 Opened [Gmail]/All Mail folder.');

                    if (WATCH_MODE) {
                        console.log('⚡ Running initial deep sync...');
                        const rawEmails = await fetchLatestEmails(imap, box, FETCH_LIMIT);
                        await processEmails(rawEmails);

                        console.log('\n🎧 Listening for new emails instantly (IMAP IDLE push)...');

                        imap.on('mail', async (numNewMsgs) => {
                            try {
                                console.log(`\n🔔 [${new Date().toLocaleTimeString()}] INSTANT PUSH: ${numNewMsgs} new email(s) arrived!`);
                                const newRawEmails = await fetchLatestEmails(imap, box, 10);
                                await processEmails(newRawEmails);
                            } catch (e) {
                                console.error('❌ Error handling push mail:', e.message);
                            }
                        });
                    } else {
                        console.log(`⚡ Mode: single run (fetching last ${FETCH_LIMIT})...`);
                        const rawEmails = await fetchLatestEmails(imap, box, FETCH_LIMIT);
                        await processEmails(rawEmails);
                        imap.end();
                    }
                } catch (innerErr) {
                    console.error('❌ Error in openBox handler:', innerErr.message);
                    imap.end();
                }
            });
        });

        imap.once('error', (err) => {
            console.error(`❌ IMAP Error: ${err.message}`);
            if (err.message?.includes('Invalid credentials')) {
                console.error('   👉 Check your GMAIL_APP_PASSWORD in .env');
            }
            setTimeout(startImap, 10000);
        });

        imap.once('end', () => {
            console.log('🔌 IMAP connection ended.');
            if (WATCH_MODE) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(startImap, 5000);
            } else {
                process.exit(0);
            }
        });

        imap.connect();
    } catch (outerErr) {
        console.error('❌ Fatal Error in startImap:', outerErr.message);
        setTimeout(startImap, 10000);
    }
})();
