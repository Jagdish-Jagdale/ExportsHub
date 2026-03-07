import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useCollection } from '../../hooks/useFirestore';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const AVAILABLE_UNITS = ['Nos', 'Kg', 'Gram', 'Litre', 'ML', 'Box', 'Pack', 'Dozen', 'Piece', 'Meter', 'Feet'];

export default function ProductManager() {
    const { data: products, loading: prodLoading } = useCollection('products');
    const { data: categories } = useCollection('categories');
    const [filterCat, setFilterCat] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = products?.filter(p => {
        const matchesCat = filterCat ? p.categoryId === filterCat : true;
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
        if (sortBy === 'newest') {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
        }
        return 0;
    }) || [];

    // Reset page on filter/search/sort change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterCat, searchTerm, sortBy]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

    const openAdd = () => {
        setEditId(null);
        setTitle('');
        setDescription('');
        setCategoryId('');
        setSelectedUnits([]);
        setImageFiles([]);
        setExistingImages([]);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditId(product.id);
        setTitle(product.title || '');
        setDescription(product.description || '');
        setCategoryId(product.categoryId || '');
        setSelectedUnits(product.units || []);
        setImageFiles([]);
        setExistingImages(product.images || []);
        setShowModal(true);
    };

    const toggleUnit = (unit) => {
        setSelectedUnits(prev =>
            prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        try {
            let uploadedUrls = [...existingImages];

            if (imageFiles.length > 0) {
                const uploads = imageFiles.map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const snap = await uploadBytes(storageRef, file);
                    return getDownloadURL(snap.ref);
                });
                const newUrls = await Promise.all(uploads);
                uploadedUrls = [...uploadedUrls, ...newUrls];
            }

            const data = {
                title: title.trim(),
                description: description.trim(),
                categoryId,
                units: selectedUnits,
                images: uploadedUrls,
            };

            if (editId) {
                await updateDoc(doc(db, 'products', editId), data);
                toast.success('Product updated!');
            } else {
                await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
                toast.success('Product added!');
            }
            setShowModal(false);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            toast.success('Product deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || '—';

    if (prodLoading) return <Loader className="py-20" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage and organize your product catalog</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" /> Add Product
                </button>
            </div>

            <hr className="border-gray-200 mt-6" />

            {/* Filter Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Search & Filters</h2>
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Category:</span>
                            <select
                                value={filterCat}
                                onChange={e => setFilterCat(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10b981] text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10b981] text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="name">A - Z</option>
                                <option value="name-desc">Z - A</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500 mt-12">
                    <p>{searchTerm ? 'No results found for your search' : 'No products yet'}</p>
                </div>
            ) : (
                <div className="mt-12 space-y-6">
                    <div className="bg-white rounded-xl border border-black/10 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 font-semibold text-gray-600 w-20">Sr. No.</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Product</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 hidden lg:table-cell">Units</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedProducts.map((product, index) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                                                        <p className="text-gray-500 text-xs truncate mt-0.5">{product.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                                                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
                                                    {getCategoryName(product.categoryId)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {product.units?.map(u => (
                                                        <span key={u} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-100">{u}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {filtered.length > itemsPerPage && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="font-semibold text-gray-900">{filtered.length}</span> products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        <HiOutlineChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-[#10b981] text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        <HiOutlineChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg my-8 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Product title" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="Product description" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field">
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_UNITS.map(unit => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => toggleUnit(unit)}
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${selectedUnits.includes(unit)
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                                                }`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                                {existingImages.length > 0 && (
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {existingImages.map((url, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files))} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
