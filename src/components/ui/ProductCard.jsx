import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <Link to={`/products/${product.id}`} className="card group">
            <div className="aspect-square overflow-hidden bg-gray-100">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.title}
                </h3>
                {product.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                )}
                {product.units?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {product.units.map(unit => (
                            <span key={unit} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                                {unit}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
