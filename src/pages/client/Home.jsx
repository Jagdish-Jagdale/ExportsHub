import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCollection } from '../../hooks/useFirestore';
import Loader from '../../components/common/Loader';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import CategoryCard from '../../components/ui/CategoryCard';
import ProductSlider from '../../components/ui/ProductSlider';

const SLIDE_INTERVAL = 7000; // 7 seconds

export default function Home() {
    const [hero, setHero] = useState(() => {
        const cached = localStorage.getItem('hero_cache');
        try {
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [heroLoading, setHeroLoading] = useState(!hero);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { data: categories, loading: catLoading } = useCollection('categories');
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const snap = await getDoc(doc(db, 'hero', 'main'));
                if (snap.exists()) {
                    const data = snap.data();
                    setHero(data);
                    // Update cache for next visit
                    localStorage.setItem('hero_cache', JSON.stringify(data));
                }
            } catch (err) {
                console.error('Error fetching hero:', err);
            } finally {
                setHeroLoading(false);
            }
        };
        fetchHero();
    }, []);

    // Slider Logic
    useEffect(() => {
        const heroImages = hero?.imageUrls || (hero?.imageUrl ? [hero.imageUrl] : []);
        if (heroImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length);
        }, SLIDE_INTERVAL);

        return () => clearInterval(interval);
    }, [hero?.imageUrls, hero?.imageUrl]);

    const heroImages = hero?.imageUrls || (hero?.imageUrl ? [hero.imageUrl] : []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[30vh] md:h-screen min-h-[220px] md:min-h-[600px] bg-[#065f46] overflow-hidden">
                {/* Background Slider */}
                <div className="absolute inset-0 z-0">
                    {heroImages.length > 0 ? (
                        heroImages.map((url, index) => (
                            <div
                                key={`slide-${index}`}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                                style={{ backgroundColor: '#065f46' }}
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className={`absolute inset-0 w-full h-full block object-contain md:object-cover object-center`}
                                    style={{
                                        backgroundColor: '#065f46'
                                    }}
                                    fetchPriority={index === 0 ? "high" : "low"}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#065f46] via-[#047857] to-[#059669]" />
                    )}
                    {/* Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-black/70" />
                </div>

                {/* Slider Indicators */}
                {heroImages.length > 1 && (
                    <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {heroImages.map((_, index) => (
                            <button
                                key={`indicator-${index}`}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-emerald-500 w-5 md:w-8' : 'bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 md:mb-6 drop-shadow-2xl leading-tight">
                        {hero?.title || 'Welcome to ExportsHub'}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-lg lg:text-2xl text-white/90 mb-6 md:mb-12 drop-shadow-lg max-w-2xl mx-auto font-medium">
                        {hero?.subtitle || 'Discover premium export products across multiple categories'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5 md:gap-5 justify-center px-6 sm:px-0">
                        <Link to="/products" className="px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-lg transition-all shadow-xl active:scale-95 group text-xs sm:text-sm md:text-base">
                            Explore Products
                        </Link>
                        <Link to="/categories" className="px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-lg border border-white/40 transition-all active:scale-95 text-xs sm:text-sm md:text-base">
                            Get a Quote
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
                        <p className="text-gray-500 mt-1 sm:mt-2 text-[13px] md:text-base">Find products organized by category</p>
                    </div>
                    {categories.length > 4 && (
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-[#10b981] hover:text-white transition-all active:scale-95"
                            >
                                <HiOutlineChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-[#10b981] hover:text-white transition-all active:scale-95"
                            >
                                <HiOutlineChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {catLoading ? (
                    <Loader className="py-12" />
                ) : categories.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No categories available yet.</p>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 md:gap-6 scrollbar-hide snap-x snap-mandatory pb-4"
                    >
                        {categories.map(cat => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                    </div>
                )}
            </section>

            {/* Top Products Slider */}
            <div className="bg-gray-50/30">
                <ProductSlider
                    title="Top Products"
                />
            </div>
        </div>
    );
}
