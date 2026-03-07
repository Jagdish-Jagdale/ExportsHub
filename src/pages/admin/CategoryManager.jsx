import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useCollection } from '../../hooks/useFirestore';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

export default function CategoryManager() {
    const { data: categories, loading } = useCollection('categories');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust based on preference

    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0; // Default to natural order from firestore
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    const openAdd = () => {
        setEditId(null);
        setName('');
        setImageFile(null);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditId(cat.id);
        setName(cat.name);
        setImageFile(null);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            let imageUrl = '';
            if (imageFile) {
                const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
                const snap = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snap.ref);
            }

            if (editId) {
                const update = { name: name.trim() };
                if (imageUrl) update.image = imageUrl;
                await updateDoc(doc(db, 'categories', editId), update);
                toast.success('Category updated!');
            } else {
                await addDoc(collection(db, 'categories'), {
                    name: name.trim(),
                    image: imageUrl,
                    createdAt: new Date().toISOString()
                });
                toast.success('Category added!');
            }
            setShowModal(false);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            toast.success('Category deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <Loader className="py-20" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">Manage and organize your product categories</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" /> Add Category
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
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10b981] text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="name">A - Z</option>
                            <option value="name-desc">Z - A</option>
                        </select>
                    </div>
                </div>
            </div>

            {paginatedCategories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500 mt-12">
                    <p>{searchTerm ? 'No results found for your search' : 'No categories yet'}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                        {paginatedCategories.map(cat => (
                            <div key={cat.id} className="bg-white rounded-xl border border-black/10 overflow-hidden shadow-sm hover:border-[#10b981] hover:shadow-md transition-all group">
                                <div className="aspect-video bg-gray-100">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                                    )}
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Footer - Only show if > itemsPerPage */}
                    {filteredCategories.length > itemsPerPage && (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredCategories.length)}</span> of <span className="font-semibold text-gray-900">{filteredCategories.length}</span> categories
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[#10b981] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">{editId ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Category name" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700" />
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
