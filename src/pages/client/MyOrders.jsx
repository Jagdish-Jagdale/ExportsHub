import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useFirestore';
import Loader from '../../components/common/Loader';
import { HiOutlineShoppingBag, HiChevronDown } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const STATUS_COLORS = {
    Pending: 'bg-amber-100 text-amber-800',
    Approved: 'bg-green-100 text-green-800',
    Completed: 'bg-emerald-100 text-emerald-800',
};

export default function MyOrders() {
    const { user } = useAuth();
    const { data: orders, loading } = useCollection('orders', {
        whereField: 'userId',
        whereValue: user?.uid
    });
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [visibleItems, setVisibleItems] = useState(50);

    const toggleOrder = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

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

    if (loading) return <Loader className="py-20" />;

    return (
        <div className="max-w-none px-4 sm:px-6 lg:px-16 py-12">
            <div className="mb-0">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
                <p className="text-gray-500 mt-2 font-medium">Check the status of your order requests</p>
            </div>

            <hr className="border-gray-200 mt-8 mb-10" />

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HiOutlineShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't placed any order requests yet. Start browsing our products to find what you need.</p>
                    <Link to="/products" className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-emerald-200">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {[...orders]
                        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                        .slice(0, visibleItems)
                        .map(order => (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div
                                    className="p-6 sm:p-8 cursor-pointer group"
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <p className="text-sm font-bold text-emerald-600 tracking-tight uppercase">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                                <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div>
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm flex items-center justify-center min-w-[100px] border border-transparent ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className={`overflow-hidden transition-all duration-300 mt-0 ${expandedOrders.has(order.id) ? 'max-h-[2000px] pt-8' : 'max-h-0'}`}>
                                        <div className="space-y-6 pt-2 border-t border-gray-50">
                                            {order.products?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 sm:gap-6">
                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                        <ImageWithFallback
                                                            src={item.image}
                                                            alt={item.title}
                                                            name={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-gray-900 truncate tracking-tight">{item.title}</p>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">{item.selectedUnit}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-gray-900 tracking-tight">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status === 'Pending' && (
                                            <div className="mt-10 p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-start gap-4 shadow-inner">
                                                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black self-center">!</div>
                                                <p className="text-xs font-bold text-emerald-800 leading-relaxed uppercase tracking-wide">
                                                    Our team will review your order request soon. Once approved, we will contact you for fulfilling the order.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {orders.length > visibleItems && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => setVisibleItems(prev => prev + 50)}
                        className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Load More Orders
                    </button>
                </div>
            )}
        </div>
    );
}
