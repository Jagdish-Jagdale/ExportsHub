import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../common/Skeleton';
import ImageWithFallback from '../common/ImageWithFallback';

export default function CategoryCard({ category, className = "" }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link
            to={`/products?category=${category.id}`}
            className={`group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${className || "min-w-[70%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[23.5%] aspect-[4/3] snap-start"}`}
        >
            <div className="absolute inset-0 z-0">
                {!imageLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none w-full h-full" />}
                <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    name={category.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity z-10" />

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-20">
                <h3 className="text-white font-bold text-lg md:text-xl drop-shadow mb-1">{category.name}</h3>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Explore Category →</span>
            </div>
        </Link>
    );
}
