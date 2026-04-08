import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { PageLoader } from '../../components/common/Loader';
import Skeleton from '../../components/common/Skeleton';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import toast from 'react-hot-toast';

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const snap = await getDoc(doc(db, 'products', id));
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() };
                    setProduct(data);
                    if (data.units?.length > 0) setSelectedUnit(data.units[0]);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <PageLoader />;

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                <Link to="/products" className="btn-primary">Back to Products</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedUnit) {
            toast.error('Please select a unit');
            return;
        }
        if (quantity < 1) {
            toast.error('Quantity must be at least 1');
            return;
        }
        addToCart(product, selectedUnit, quantity);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link to="/products" className="hover:text-emerald-600 transition-colors">Products</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image */}
                <div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 relative">
                        <ImageWithFallback
                            src={product.images?.[activeImage]}
                            alt={product.title}
                            name={product.title}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {!imageLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none w-full h-full" />}
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setActiveImage(i);
                                        setImageLoaded(false);
                                    }}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === activeImage ? 'border-emerald-600' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <ImageWithFallback
                                        src={img}
                                        alt=""
                                        name=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    {product.description && (
                        <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
                    )}

                    {/* Unit Selection */}
                    {product.units?.length > 0 && (
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Select Unit</label>
                            <div className="flex flex-wrap gap-3">
                                {product.units.map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => setSelectedUnit(unit)}
                                        className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all ${selectedUnit === unit
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30'
                                            }`}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-10">
                        <label className="block text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Quantity</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all active:scale-90"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-24 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all active:scale-90"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <div className="mt-auto pt-6 border-t border-gray-100 sm:border-t-0 sm:pt-0">
                        <button
                            onClick={handleAddToCart}
                            className="btn-primary w-full text-lg !py-4 !px-12 shadow-xl shadow-emerald-500/20"
                        >
                            {user ? 'Add to Cart' : 'Login to Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
