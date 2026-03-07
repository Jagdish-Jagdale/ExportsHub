import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useFirestore';
import Loader from '../../components/common/Loader';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
    Pending: 'bg-amber-100 text-amber-800',
    Approved: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
};

export default function MyOrders() {
    const { user } = useAuth();
    const { data: orders, loading } = useCollection('orders', {
        whereField: 'userId',
        whereValue: user?.uid
    });

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
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-500 mt-1">Check the status of your order requests</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HiOutlineShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-6">You haven't placed any order requests yet.</p>
                    <Link to="/products" className="btn-primary">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-50 pt-6">
                                    <ul className="space-y-4">
                                        {order.products?.map((item, i) => (
                                            <li key={i} className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                                                            <HiOutlineShoppingBag className="w-6 h-6 text-emerald-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.selectedUnit}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">Qty: {item.quantity}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {order.status === 'Pending' && (
                                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl flex items-start gap-3">
                                        <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">i</div>
                                        <p className="text-xs text-emerald-800 leading-relaxed">
                                            Our team will review your order request soon. Once approved, we will contact you for fulfilling the order.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
