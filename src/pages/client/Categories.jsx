import React from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useFirestore';
import Loader from '../../components/common/Loader';

export default function Categories() {
    const { data: categories, loading } = useCollection('categories');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
                <p className="text-gray-500 mt-2">Browse our complete range of product categories</p>
            </div>

            {loading ? (
                <Loader className="py-20" />
            ) : categories.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">No categories available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${cat.id}`}
                            className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-white font-bold text-xl drop-shadow">{cat.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
