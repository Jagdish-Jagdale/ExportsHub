import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';

    // Handle scroll for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch {
            toast.error('Failed to logout');
        }
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/categories', label: 'Categories' },
        { to: '/products', label: 'Products' },
        { to: '/about', label: 'About Us' },
    ];

    // Style logic
    const navbarBg = isHome
        ? (scrolled ? 'bg-white shadow-md' : 'bg-white md:bg-transparent')
        : 'bg-white border-b border-gray-100';

    const textColor = isHome
        ? (scrolled ? 'text-gray-700' : 'text-gray-700 md:text-white')
        : 'text-gray-700';

    const logoColor = isHome
        ? (scrolled ? 'text-gray-900' : 'text-gray-900 md:text-white')
        : 'text-gray-900';

    const activeColor = 'text-[#10b981]';

    return (
        <nav className={`${navbarBg} ${isHome ? 'md:fixed sticky' : 'sticky'} w-full top-0 z-50 transition-all duration-300`}>
            <div className="w-full mx-auto px-4 sm:px-10 lg:px-16">
                <div className="flex items-center justify-between md:grid md:grid-cols-3 h-20 md:h-24">
                    {/* Logo - Left */}
                    <div className="flex items-center justify-start">
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <img
                                src="/ExportsHubLogo.png"
                                alt="ExportsHub Logo"
                                className="h-14 md:h-20 rounded-xl object-contain transition-all duration-300"
                            />
                        </Link>
                    </div>

                    {/* Desktop Nav - Center */}
                    <div className="hidden md:flex justify-center items-center gap-12">
                        {navLinks.map(link => {
                            const isActive = link.to === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`${isActive ? 'text-[#10b981]' : textColor} hover:text-[#10b981] font-bold text-sm tracking-wide uppercase transition-all relative group whitespace-nowrap`}
                                >
                                    {link.label}
                                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#10b981] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - End */}
                    <div className="flex items-center justify-end gap-3 md:gap-6">
                        {user && (
                            <Link to="/cart" className={`relative p-2.5 ${textColor} hover:text-[#10b981] transition-colors`}>
                                <HiOutlineShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-[#10b981] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white/10">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="hidden md:flex items-center gap-6">
                                {isAdmin && (
                                    <Link to="/admin" className="text-sm font-bold text-[#10b981] hover:text-[#059669] transition-colors bg-[#10b981]/10 px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wide">
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    to="/my-orders"
                                    className={`text-sm font-bold transition-all relative group whitespace-nowrap uppercase tracking-wide ${location.pathname.startsWith('/my-orders') ? 'text-[#10b981]' : textColor} hover:text-[#10b981]`}
                                >
                                    My Orders
                                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#10b981] transition-all ${location.pathname.startsWith('/my-orders') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                </Link>
                                <button onClick={handleLogout} className={`px-3 py-2 text-sm font-bold ${textColor} hover:bg-gray-100/10 rounded-xl transition-colors whitespace-nowrap uppercase tracking-wide`}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className={`px-4 py-2 text-sm font-bold ${textColor} hover:bg-white/10 rounded-xl transition-colors`}>
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold px-6 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile toggle */}
                        <button className={`md:hidden p-2 ${textColor}`} onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-4 py-6 space-y-3 bg-white shadow-2xl rounded-b-3xl border-t border-gray-50">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-gray-800 hover:bg-emerald-50 hover:text-[#10b981] rounded-xl font-bold transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-gray-100">
                            {user ? (
                                <div className="space-y-3">
                                    {isAdmin && (
                                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[#10b981] bg-emerald-50 rounded-xl font-bold">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl font-bold">
                                        My Orders
                                    </Link>
                                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-center text-gray-800 bg-gray-50 rounded-xl font-bold">
                                        Login
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-center text-white bg-[#10b981] rounded-xl font-bold">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
