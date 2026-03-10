# ExportsHub IMAP Reader — Setup Guide

Fetches emails from `printfhelloworld99@gmail.com` via IMAP and syncs them into the Firestore `replies` collection so they appear in the Admin → Orders → **Replies** tab.

---

## ✅ Prerequisites

### 1. Enable Gmail IMAP
1. Open [mail.google.com](https://mail.google.com) logged in as `printfhelloworld99@gmail.com`
2. Go to **Settings → See all settings → Forwarding and POP/IMAP**
3. Under **IMAP access** → select **Enable IMAP** → click **Save Changes**

### 2. Create a Gmail App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Type a name (e.g. `ExportsHub IMAP`) → click **Create**
3. Copy the **16-character password** shown

### 3. Get Firebase Service Account Key
1. Open [Firebase Console](https://console.firebase.google.com) → project **export-hub-838f9**
2. Click ⚙️ **Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"** → confirm → download the `.json` file
4. Rename it to `serviceAccountKey.json` and place it in this `backend/` folder

---

## ⚙️ Configuration

Edit `backend/.env`:
```env
GMAIL_USER=printfhelloworld99@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop    ← paste your App Password here
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
POLL_INTERVAL_MS=60000      # check every 60 seconds (in watch mode)
FETCH_LIMIT=50              # fetch last 50 emails per sync
```

---

## 🚀 Running the Script

### Install dependencies (first time only)
Open a terminal in the `backend/` folder and run:
```bash
npm install
```

### Run once (sync emails now)
```bash
node imap-reader.js
```

### Run continuously (auto-poll every 60s)
```bash
node imap-reader.js --watch
```

---

## 📬 What it does
- Connects to `imap.gmail.com:993` (SSL)
- Fetches the last **50 emails** from the INBOX
- Parses each email (subject, sender, body, date)
- Saves new emails to Firestore `replies` collection with fields:
  - `fromEmail`, `fromName`, `subject`, `message`, `createdAt`, `status: "Pending"`, `uid`
- **Deduplicates** — already-synced emails are never saved twice
- Emails appear instantly in Admin → Orders → **Replies** tab
