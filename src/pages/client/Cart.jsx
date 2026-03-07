import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { HiOutlineTrash } from 'react-icons/hi';
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
            toast.success('Order placed successfully!');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="space-y-4 mb-8">
                {cart.map((item, index) => (
                    <div key={`${item.productId}-${item.selectedUnit}`} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex items-center gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Unit: <span className="font-medium text-emerald-600">{item.selectedUnit}</span></p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.productId, item.selectedUnit, item.quantity - 1)}
                                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
                            >
                                −
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.productId, item.selectedUnit, item.quantity + 1)}
                                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
                            >
                                +
                            </button>
                        </div>

                        {/* Remove */}
                        <button
                            onClick={() => removeFromCart(item.productId, item.selectedUnit)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <HiOutlineTrash className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-bold text-lg">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <button onClick={handlePlaceOrder} className="btn-primary w-full text-base !py-3">
                    Place Order
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">By placing an order, you're submitting an inquiry for these products.</p>
            </div>
        </div>
    );
}
