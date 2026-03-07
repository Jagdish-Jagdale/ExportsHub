import React, { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';
import { FiPlus, FiTrash2, FiSend, FiArrowLeft } from 'react-icons/fi';

export default function QuotationForm({ orderId, onClose, onSuccess }) {
    const [order, setOrder] = useState(null);
    const [clientInfo, setClientInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [additionalCharges, setAdditionalCharges] = useState([]);
    const [companyName, setCompanyName] = useState('ExportsHub');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [existingQuotation, setExistingQuotation] = useState(null);
    const [history, setHistory] = useState([]);

    // Load order + client info + quotation history
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Load order
                const orderSnap = await getDoc(doc(db, 'orders', orderId));
                if (!orderSnap.exists()) {
                    toast.error('Order not found');
                    onClose();
                    return;
                }
                const orderData = { id: orderSnap.id, ...orderSnap.data() };
                setOrder(orderData);

                // Load client info
                const userSnap = await getDoc(doc(db, 'users', orderData.userId));
                if (userSnap.exists()) setClientInfo(userSnap.data());

                // Auto-populate products from order
                setProducts(orderData.products.map(p => ({
                    ...p,
                    unitPrice: '',
                    subtotal: 0,
                })));

                // Fetch quotation history for this order
                const q = query(
                    collection(db, 'quotations'),
                    where('orderId', '==', orderId)
                );
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                    const allQuots = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    // Sort locally by createdAt desc (if not done by server)
                    allQuots.sort((a, b) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                        return dateB - dateA;
                    });

                    setHistory(allQuots);
                    const latest = allQuots[0];
                    setExistingQuotation(latest);

                    // Pre-fill with LATEST quotation data
                    setProducts(latest.products.map(p => ({
                        ...p,
                        unitPrice: latest.products.find(lp => lp.productId === p.productId)?.unitPrice || '',
                        subtotal: (Number(p.quantity) || 0) * (Number(latest.products.find(lp => lp.productId === p.productId)?.unitPrice) || 0)
                    })));
                    setAdditionalCharges(latest.additionalCharges || []);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };
        if (orderId) load();
    }, [orderId, onClose]);

    const updateProduct = (index, field, value) => {
        setProducts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            const qty = Number(updated[index].quantity) || 0;
            const price = Number(updated[index].unitPrice) || 0;
            updated[index].subtotal = qty * price;
            return updated;
        });
    };

    const addCharge = () => {
        setAdditionalCharges(prev => [...prev, { label: '', amount: '' }]);
    };

    const updateCharge = (index, field, value) => {
        setAdditionalCharges(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const removeCharge = (index) => {
        setAdditionalCharges(prev => prev.filter((_, i) => i !== index));
    };

    const productTotal = products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const chargesTotal = additionalCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const grandTotal = productTotal + chargesTotal;

    const handleSendQuotation = async () => {
        // Validate
        const incomplete = products.some(p => !p.unitPrice || Number(p.unitPrice) <= 0);
        if (incomplete) { toast.error('Please enter unit price for all products'); return; }
        const incompleteCharge = additionalCharges.some(c => !c.label || !c.amount);
        if (incompleteCharge) { toast.error('Please fill in all additional charge details'); return; }

        setSending(true);
        try {
            const quotationData = {
                orderId,
                userId: order.userId,
                userEmail: order.userEmail,
                products: products.map(p => ({
                    productId: p.productId,
                    title: p.title,
                    selectedUnit: p.selectedUnit,
                    quantity: Number(p.quantity),
                    unitPrice: Number(p.unitPrice),
                    subtotal: p.subtotal,
                })),
                additionalCharges: additionalCharges.map(c => ({
                    label: c.label,
                    amount: Number(c.amount),
                })),
                totalAmount: grandTotal,
                status: 'sent',
                createdAt: serverTimestamp(),
            };

            // ALWAYS create a NEW quotation document for history
            const ref = await addDoc(collection(db, 'quotations'), quotationData);
            const quotationId = ref.id;

            // Update order status to "quoted"
            await updateDoc(doc(db, 'orders', orderId), { status: 'quoted' });

            // Call the Cloud Function to send email
            const sendQuotationEmail = httpsCallable(functions, 'sendQuotationEmail');
            await sendQuotationEmail({
                clientEmail: order.userEmail,
                clientName: clientInfo?.name || 'Customer',
                quotationId,
                products: products.map(p => ({
                    title: p.title,
                    selectedUnit: p.selectedUnit,
                    quantity: Number(p.quantity),
                    unitPrice: Number(p.unitPrice),
                    subtotal: p.subtotal,
                })),
                additionalCharges: additionalCharges.map(c => ({
                    label: c.label,
                    amount: Number(c.amount),
                })),
                totalAmount: grandTotal,
                companyName,
            });

            toast.success('Quotation saved and email sent!');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error sending quotation:', err);
            toast.error(err.message || 'Failed to send quotation');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Loader className="py-20" />;
    if (!order) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                    title="Back"
                >
                    <FiArrowLeft className="w-7 h-7" strokeWidth={2.5} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {existingQuotation ? 'Update Quotation' : 'Create Quotation'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Order <span className="font-semibold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</span> · {order.userEmail}
                    </p>
                </div>
            </div>

            <hr className="border-gray-200 mt-6" />

            <div className="max-w-4xl mx-auto space-y-6 mt-8">
                {/* Company + Client Info */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Company Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                placeholder="ExportsHub"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Client</label>
                            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm select-none">
                                <span className="font-semibold text-gray-900">{clientInfo?.name || 'N/A'}</span>
                                <span className="text-gray-400 ml-2">· {order.userEmail}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quotation Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="text-right px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price (₹)</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((product, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{product.title}</p>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-600 font-medium">{product.selectedUnit}</td>
                                        <td className="px-4 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                value={product.quantity}
                                                onChange={e => updateProduct(index, 'quantity', e.target.value)}
                                                className="w-20 text-center border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 outline-none mx-auto block transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={product.unitPrice}
                                                    onChange={e => updateProduct(index, 'unitPrice', e.target.value)}
                                                    className="w-28 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 outline-none transition-all font-semibold"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-gray-400 text-xs mr-1">₹</span>
                                            <span className="font-extrabold text-gray-900">
                                                {product.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Additional Charges */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Additional Charges</h2>
                        <button onClick={addCharge} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                            <FiPlus className="w-4 h-4 text-emerald-600" /> ADD CHARGE
                        </button>
                    </div>
                    {additionalCharges.length === 0 ? (
                        <div className="py-8 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 font-medium">No additional charges added to this quotation.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {additionalCharges.map((charge, i) => (
                                <div key={i} className="flex gap-4 items-center animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={charge.label}
                                            onChange={e => updateCharge(i, 'label', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 outline-none transition-all"
                                            placeholder="Charge Label (e.g. Shipping)"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={charge.amount}
                                            onChange={e => updateCharge(i, 'amount', e.target.value)}
                                            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 outline-none transition-all font-semibold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button onClick={() => removeCharge(i)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Totals + Send */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-6">
                    <div className="flex flex-col items-end gap-3 mb-8">
                        <div className="flex justify-between w-full sm:w-80 text-sm">
                            <span className="text-gray-500 font-medium">Products Subtotal</span>
                            <span className="font-bold text-gray-900">₹{productTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {additionalCharges.length > 0 && (
                            <div className="flex justify-between w-full sm:w-80 text-sm">
                                <span className="text-gray-500 font-medium">Additional Charges</span>
                                <span className="font-bold text-indigo-600">₹{chargesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="w-full sm:w-80 border-t border-gray-100 pt-3 mt-1 flex justify-between items-baseline">
                            <span className="text-base font-bold text-gray-900">Grand Total</span>
                            <div className="text-right">
                                <span className="text-2xl font-black text-emerald-600">
                                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-gray-100">
                        <div className="flex-1 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                <span className="text-emerald-500 mr-1.5 font-bold">●</span>
                                Email will be sent to <strong className="text-gray-900 underline decoration-emerald-200">{order.userEmail}</strong>
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                <span className="text-purple-500 mr-1.5 font-bold">●</span>
                                This will also update order status to <strong className="text-purple-600 uppercase tracking-widest text-[9px]">Quoted</strong>
                            </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendQuotation}
                                disabled={sending}
                                className="flex-1 sm:flex-none btn-primary flex items-center gap-2 min-w-[200px] justify-center disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-4 h-4" />
                                        {existingQuotation ? 'Resend Quotation' : 'Send Quotation'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quotation History</h2>
                            <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-400 px-2 py-1 rounded-full">{history.length} VERSIONS</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {history.map((item, i) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-black text-gray-900">Version {history.length - i}</p>
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase tracking-tighter">
                                                    ID: {item.id.slice(0, 6).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-1 font-medium italic">Sent on {formatDate(item.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600 leading-none">₹{item.totalAmount?.toLocaleString('en-IN')}</p>
                                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Quoted Amount</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.products.map((p, idx) => (
                                            <span key={idx} className="text-[10px] px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold shadow-sm">
                                                {p.title} <span className="text-gray-300 mx-1">·</span> {p.quantity} {p.selectedUnit} @ ₹{p.unitPrice}
                                            </span>
                                        ))}
                                        {item.additionalCharges?.map((c, idx) => (
                                            <span key={idx} className="text-[10px] px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg font-bold italic shadow-sm">
                                                {c.label}: ₹{c.amount}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
