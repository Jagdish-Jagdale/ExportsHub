import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlinePhotograph, HiOutlineCollection, HiOutlineCube, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
    { to: '/admin', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { to: '/admin/hero', icon: HiOutlinePhotograph, label: 'Hero Section' },
    { to: '/admin/categories', icon: HiOutlineCollection, label: 'Categories' },
    { to: '/admin/products', icon: HiOutlineCube, label: 'Products' },
    { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Orders' },
];

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <img src="/ExportsHubLogo.png" alt="Logo" className="h-10 w-auto rounded object-contain" />
                        <span className="text-lg font-bold text-gray-900 ml-1">Admin Panel</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1.5">
                    {sidebarLinks.map(link => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100 space-y-1.5">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                        Back to Store
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
                        <HiOutlineLogout className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/ExportsHubLogo.png" alt="Logo" className="h-8 w-auto rounded object-contain" />
                    <span className="text-lg font-bold text-gray-900 ml-1">Admin</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
                    {sidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
                    <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl">
                        <div className="p-6 border-b border-gray-100">
                            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                        </div>
                        <nav className="p-4 space-y-1.5">
                            {sidebarLinks.map(link => (
                                <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100 space-y-1.5">
                            <button onClick={() => { navigate('/'); setSidebarOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 w-full">
                                <HiOutlineArrowLeft className="w-5 h-5" />
                                Back to Store
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                                <HiOutlineLogout className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
