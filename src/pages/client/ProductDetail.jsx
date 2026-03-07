import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { PageLoader } from '../../components/common/Loader';
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
                {/* Images */}
                <div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                        {product.images?.length > 0 ? (
                            <img
                                src={product.images[activeImage]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === activeImage ? 'border-emerald-600' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    {product.description && (
                        <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
                    )}

                    {/* Unit Selection */}
                    {product.units?.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">Select Unit</label>
                            <div className="flex flex-wrap gap-2">
                                {product.units.map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => setSelectedUnit(unit)}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${selectedUnit === unit
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                                            }`}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 text-center input-field"
                            />
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="btn-primary w-full sm:w-auto text-base !py-3 !px-10"
                    >
                        {user ? 'Add to Cart' : 'Login to Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
