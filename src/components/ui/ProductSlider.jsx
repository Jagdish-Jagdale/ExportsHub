import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useCollection } from '../../hooks/useFirestore';
import PremiumProductCard from './PremiumProductCard';
import Loader from '../common/Loader';

export default function ProductSlider({ categoryId, title }) {
    const { data: products, loading } = useCollection('products', {
        whereField: categoryId ? 'categoryId' : null,
        whereValue: categoryId || null
    });
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return null; // Or a skeleton if preferred
    if (!products || products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <Link
                        to="/products"
                        className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest active:scale-95"
                    >
                        See All
                    </Link>
                    <div className="hidden sm:flex gap-2.5">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2.5 rounded-full bg-white shadow-lg border border-gray-50 text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                        >
                            <HiOutlineChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2.5 rounded-full bg-white shadow-lg border border-gray-50 text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                        >
                            <HiOutlineChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 md:gap-8 scrollbar-hide snap-x snap-mandatory pb-8 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                `}</style>
                {products.slice(0, 10).map(product => (
                    <div key={product.id} className="snap-start">
                        <PremiumProductCard product={product} />
                    </div>
                ))}

                {/* Spacer at the end for clean scrolling */}
                <div className="min-w-[1px] h-full flex-shrink-0" />
            </div>
        </section>
    );
}
