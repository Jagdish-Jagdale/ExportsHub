import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../common/Skeleton';
import ImageWithFallback from '../common/ImageWithFallback';

export default function ProductCard({ product }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link to={`/products/${product.id}`} className="card group">
            <div className="aspect-square overflow-hidden bg-gray-50 relative">
                {!imageLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none w-full h-full" />}
                <ImageWithFallback
                    src={product.images?.[0]}
                    alt={product.title}
                    name={product.title}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                />
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
