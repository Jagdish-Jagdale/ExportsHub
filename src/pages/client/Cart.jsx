import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { HiOutlineTrash } from 'react-icons/hi';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import toast from 'react-hot-toast';

export default function Cart() {
    const { user } = useAuth();
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                userEmail: user.email,
                products: cart.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    image: item.image,
                    selectedUnit: item.selectedUnit,
                    quantity: item.quantity,
                })),
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            clearCart();
            toast.success('Order placed successfullyah!');
            navigate('/');
        } catch (err) {
            console.error('Error placing order:', err);
            toast.error('Failed to place order. Please try again.');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Start browsing our products and add items to your cart</p>
                <Link to="/products" className="btn-primary">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Cart Items - Left Column */}
                <div className="flex-1 w-full lg:pr-6">
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #e2e8f0;
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #cbd5e1;
                        }
                    `}</style>
                    <div className="custom-scrollbar overflow-y-auto max-h-[680px] pr-4">
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={`${item.productId}-${item.selectedUnit}`} className="bg-white rounded-[2rem] border border-gray-100 p-4 sm:p-5 flex items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                    {/* Image Container - Square Rounded */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                        <ImageWithFallback
                                            src={item.image}
                                            alt={item.title}
                                            name={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info - Middle */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight">{item.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{item.selectedUnit}</p>
                                        <p className="mt-2 text-sm font-black text-gray-900">
                                            Price on Inquiry <span className="text-xs font-normal text-gray-400 ml-1">per item</span>
                                        </p>
                                    </div>

                                    {/* Controls - Right */}
                                    <div className="flex flex-col items-end gap-3 self-stretch justify-between py-1">
                                        <div className="flex items-center gap-0 bg-gray-50 rounded-full border border-gray-200 overflow-hidden shadow-inner p-1">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.selectedUnit, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-all text-lg font-medium"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.selectedUnit, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-all text-lg font-medium"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.productId, item.selectedUnit)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                            title="Remove item"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Section - Right Column */}
                <div className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-28">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Total Products</span>
                                <span className="text-gray-900 font-bold">{cart.length}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Total Quantity</span>
                                <span className="text-gray-900 font-bold">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                        </div>

                        <hr className="border-gray-50 mb-6" />


                        <button
                            onClick={handlePlaceOrder}
                            className="w-full py-4 bg-[#065f46] hover:bg-[#054a37] text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                        >
                            Proceed to Inquiry
                        </button>

                        <Link to="/products" className="block text-center mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest underline-offset-4 hover:underline">
                            Continue Shopping
                        </Link>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-600 font-black text-xs">!</div>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                            Note: This is a quotation-based system. We will contact you with specific pricing and fulfillment details for your order.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
