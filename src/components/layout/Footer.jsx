import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">E</span>
                            </div>
                            <span className="text-xl font-bold text-white">Exports<span className="text-emerald-500">Hub</span></span>
                        </Link>
                        <p className="text-sm leading-relaxed">Your trusted platform for browsing and ordering quality export products across multiple categories.</p>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                            <li><Link to="/categories" className="hover:text-emerald-400 transition-colors">Categories</Link></li>
                            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li>support@exportshub.com</li>
                            <li>+91 12345 67890</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
                    &copy; {new Date().getFullYear()} ExportsHub. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
