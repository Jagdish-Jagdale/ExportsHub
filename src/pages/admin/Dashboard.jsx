import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { HiOutlineCube, HiOutlineCollection, HiOutlineClipboardList, HiOutlineClock } from 'react-icons/hi';

export default function Dashboard() {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        pendingOrders: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodSnap, catSnap, orderSnap, pendingSnap] = await Promise.all([
                    getCountFromServer(collection(db, 'products')),
                    getCountFromServer(collection(db, 'categories')),
                    getCountFromServer(collection(db, 'orders')),
                    getCountFromServer(query(collection(db, 'orders'), where('status', '==', 'Pending'))),
                ]);
                setStats({
                    products: prodSnap.data().count,
                    categories: catSnap.data().count,
                    orders: orderSnap.data().count,
                    pendingOrders: pendingSnap.data().count,
                });
            } catch (err) {
                console.error('Error fetching statskk:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Products', value: stats.products, icon: HiOutlineCube, color: 'bg-green-700' },
        { label: 'Categories', value: stats.categories, icon: HiOutlineCollection, color: 'bg-emerald-500' },
        { label: 'Total Orders', value: stats.orders, icon: HiOutlineClipboardList, color: 'bg-purple-500' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: HiOutlineClock, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome to your ExportsHub admin panel</p>
            </div>

            <hr className="border-gray-200 mt-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? '...' : card.value}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
