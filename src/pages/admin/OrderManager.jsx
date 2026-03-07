import React, { useEffect, useRef, useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCollection } from '../../hooks/useFirestore';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { FiFileText, FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import QuotationForm from '../../components/admin/QuotationForm';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Completed'];
const STATUS_COLORS = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Approved: 'bg-blue-50 text-blue-700 border-blue-100',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    quoted: 'bg-purple-50 text-purple-700 border-purple-100',
};

export default function OrderManager() {
    const { data: orders, loading: ordersLoading } = useCollection('orders');
    const { data: users, loading: usersLoading } = useCollection('users');
    const [sortBy, setSortBy] = useState('date-desc');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const prevOrderCountRef = useRef(0);

    // Create a map for user names
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
    }, {});

    // Real-time notification for new orders
    useEffect(() => {
        if (prevOrderCountRef.current > 0 && orders.length > prevOrderCountRef.current) {
            toast('🔔 New order received!', {
                icon: '📦',
                style: { background: '#065f46', color: '#fff' },
                duration: 5000,
            });
        }
        prevOrderCountRef.current = orders.length;
    }, [orders.length]);

    const updateStatus = async (orderId, status) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status });
            toast.success(`Order ${status.toLowerCase()}`);
        } catch {
            toast.error('Failed to update status');
        }
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

    // Filtering & Sorting logic
    const filteredAndSortedOrders = orders
        .filter(order => {
            const matchesStatus = statusFilter === 'All' ? true : order.status?.toLowerCase() === statusFilter.toLowerCase();
            const customerName = userMap[order.userId]?.toLowerCase() || '';
            const orderId = order.id?.toLowerCase() || '';
            const userEmail = order.userEmail?.toLowerCase() || '';
            const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
                orderId.includes(searchTerm.toLowerCase()) ||
                userEmail.includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'date-desc') {
                const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
                const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
                return t2 - t1;
            }
            if (sortBy === 'date-asc') {
                const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
                const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
                return t1 - t2;
            }
            if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
            if (sortBy === 'name') {
                const nameA = userMap[a.userId] || '';
                const nameB = userMap[b.userId] || '';
                return nameA.localeCompare(nameB);
            }
            return 0;
        });

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);

    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const toggleOrder = (id) => {
        setExpandedOrders(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (ordersLoading || usersLoading) return <Loader className="py-20" />;

    // If an order is selected, show the Quotation View "as a page"
    if (selectedOrderId) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <QuotationForm
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onSuccess={() => setSelectedOrderId(null)}
                />
            </div>
        );
    }

    const filterOptions = ['All', 'Pending', 'Quoted', 'Approved', 'Completed'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500 mt-1">Manage and track customer orders and quotations</p>
                </div>
            </div>

            <hr className="border-gray-200 mt-6" />

            {/* Search & Filter Card */}
            <div className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Search & Filters</h2>
                </div>
                <hr className="border-gray-100" />
                <div className="p-4 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by ID, customer name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10b981] text-sm"
                        >
                            <option value="date-desc">Latest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="status">Status</option>
                            <option value="name">Customer Name</option>
                        </select>
                    </div>
                </div>
                <hr className="border-gray-100" />
            </div>

            {/* Status Quick Filters */}
            <div className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden px-4">
                <div className="flex items-center gap-8 overflow-x-auto">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setStatusFilter(opt)}
                            className={`px-1 py-4 text-sm font-bold transition-all relative shrink-0 flex items-center gap-2 ${statusFilter === opt
                                ? 'text-[#10b981]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {opt}
                            <span className={`text-[10px] font-medium ${statusFilter === opt ? 'text-[#10b981]/70' : 'text-gray-400'}`}>
                                {opt === 'All' ? orders.length : orders.filter(o => o.status?.toLowerCase() === opt.toLowerCase()).length}
                            </span>
                            {statusFilter === opt && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {paginatedOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500 mt-12">
                    <p>No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} orders found matching your search</p>
                </div>
            ) : (
                <div className="mt-12 space-y-4">
                    {paginatedOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                <span className="text-gray-300">|</span>
                                                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-tight truncate">
                                                    {userMap[order.userId] || 'Guest Customer'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                                <span className="text-gray-200">·</span>
                                                <p className="text-xs text-gray-600 truncate">By: <strong className="text-gray-900 font-bold">{order.userEmail || 'Unknown'}</strong></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 border-r border-gray-100 pr-3 mr-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {order.status}
                                                </span>
                                                <select
                                                    value={order.status === 'quoted' ? 'Pending' : order.status}
                                                    onChange={e => updateStatus(order.id, e.target.value)}
                                                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => setSelectedOrderId(order.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
                                            >
                                                <FiFileText className="w-4 h-4" />
                                                Quotation
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleOrder(order.id)}
                                        className={`p-2 transition-all duration-300 flex-shrink-0 ${expandedOrders.has(order.id) ? 'rotate-180 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <FiChevronDown className="w-6 h-6" strokeWidth={3} />
                                    </button>
                                </div>

                                {/* Products Accordion */}
                                {expandedOrders.has(order.id) && (
                                    <div className="border-t border-gray-100 pt-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-gray-500 text-xs uppercase">
                                                    <th className="text-left pb-2 font-medium">Product</th>
                                                    <th className="text-left pb-2 font-medium">Unit</th>
                                                    <th className="text-right pb-2 font-medium">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {order.products?.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="py-2 text-gray-900 font-medium">{item.title || item.productId}</td>
                                                        <td className="py-2 text-gray-600">{item.selectedUnit}</td>
                                                        <td className="py-2 text-right text-gray-900 font-medium">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Footer */}
            {filteredAndSortedOrders.length > itemsPerPage && (
                <div className="px-6 py-4 bg-white rounded-xl border border-black/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredAndSortedOrders.length)}</span> of <span className="font-semibold text-gray-900">{filteredAndSortedOrders.length}</span> orders
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm text-gray-600"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-[#10b981] text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm text-gray-600"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
