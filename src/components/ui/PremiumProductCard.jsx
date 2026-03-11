import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineShoppingCart, HiStar } from 'react-icons/hi';
import Skeleton from '../common/Skeleton';
import ImageWithFallback from '../common/ImageWithFallback';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

export default function PremiumProductCard({ product }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const cartItem = {
            productId: product.id,
            title: product.title,
            image: product.images?.[0] || '',
            selectedUnit: product.units?.[0] || 'Nos',
            quantity: 1
        };

        addToCart(cartItem);
        toast.success(`${product.title} added to cart!`);
    };

    return (
        <div className="group relative bg-white rounded-[2rem] p-4 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 min-w-[240px] w-full max-w-[280px] snap-start">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-400 opacity-80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-700/60" />
                </div>
                <button className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                    <HiOutlineHeart className="w-4 h-4" />
                </button>
            </div>

            {/* Image Section */}
            <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-50 shadow-inner">
                {!imageLoaded && <Skeleton className="absolute inset-0 z-10" />}
                <ImageWithFallback
                    src={product.images?.[0]}
                    alt={product.title}
                    name={product.title}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {product.isNew && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg z-20">
                        New
                    </div>
                )}
            </Link>

            {/* Content Section */}
            <div className="px-1 pb-1">
                <h3 className="text-base font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight">
                    {product.title}
                </h3>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-xl transition-all duration-300 group/btn shadow-sm hover:shadow-emerald-200 hover:shadow-lg active:scale-95 text-sm"
                >
                    <HiOutlineShoppingCart className="w-4 h-4 group-hover/btn:animate-bounce" />
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>
    );
}
