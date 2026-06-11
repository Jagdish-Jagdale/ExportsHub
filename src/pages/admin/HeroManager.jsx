import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function HeroManager() {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageUrls, setImageUrls] = useState([]); // Now an arrayyy
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletedUrls, setDeletedUrls] = useState([]); // Track existing URLs to delete from storage on save

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState(null); // { type: 'existing' | 'new', index: number }

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const snap = await getDoc(doc(db, 'hero', 'main'));
                if (snap.exists()) {
                    const data = snap.data();
                    setTitle(data.title || '');
                    setSubtitle(data.subtitle || '');
                    // Handle transition from single string to array
                    const imgs = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
                    setImageUrls(imgs);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHero();
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
    };

    const handleDeleteClick = (type, index) => {
        setDeleteConfig({ type, index });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteConfig) return;
        const { type, index } = deleteConfig;

        if (type === 'existing') {
            const urlToRemove = imageUrls[index];
            setDeletedUrls(prev => [...prev, urlToRemove]);
            setImageUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            setImageFiles(prev => prev.filter((_, i) => i !== index));
        }

        setShowDeleteModal(false);
        setDeleteConfig(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrls = [...imageUrls];

            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(async (file) => {
                    const storageRef = ref(storage, `hero/${Date.now()}_${file.name}`);
                    const snap = await uploadBytes(storageRef, file);
                    return getDownloadURL(snap.ref);
                });
                const newUrls = await Promise.all(uploadPromises);
                finalImageUrls = [...finalImageUrls, ...newUrls];
            }

            if (finalImageUrls.length === 0) {
                toast.error('Please add at least one image');
                setSaving(false);
                return;
            }

            await setDoc(doc(db, 'hero', 'main'), {
                title,
                subtitle,
                imageUrls: finalImageUrls,
                // Legacy support
                imageUrl: finalImageUrls[0] || ''
            });

            // Delete removed images from storage
            const deletePromises = deletedUrls.map(url => {
                const storageRef = ref(storage, url);
                return deleteObject(storageRef).catch(err => {
                    console.error("Error deleting hero image from storage:", err);
                });
            });
            await Promise.all(deletePromises);
            setDeletedUrls([]); // Clear after successful delete

            setImageUrls(finalImageUrls);
            setImageFiles([]);
            toast.success('Hero section updated!');
        } catch (err) {
            console.error('Error saving:', err);
            toast.error('Failed to update hero section');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader className="py-20" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Hero Section</h1>
                    <p className="text-gray-500 mt-1">Update the homepage hero slider</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-8"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <hr className="border-gray-200" />

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Hero Content & Slider</h2>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <span className={`text-[11px] font-bold tracking-wider ${title.length >= 60 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {title.length} / 60 CHARS
                            </span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={e => {
                                const val = e.target.value;
                                setTitle(val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            maxLength={60}
                            className="input-field"
                            placeholder="e.g. Welcome to ExportsHub"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                            <span className={`text-[11px] font-bold tracking-wider ${subtitle.length >= 120 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {subtitle.length} / 120 CHARS
                            </span>
                        </div>
                        <textarea
                            value={subtitle}
                            onChange={e => {
                                const val = e.target.value;
                                setSubtitle(val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            maxLength={120}
                            className="input-field"
                            rows={3}
                            placeholder="e.g. Discover premium export products across categories..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center justify-between">
                            <span>Background Slider Images <span className="text-red-500 text-lg">*</span></span>
                            <span className="text-[11px] text-emerald-600 italic font-medium animate-pulse">
                                * Note: Save your changes to apply all updates to the landing page slider.
                            </span>
                        </label>

                        <div className="max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {imageUrls.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border border-black/10 shadow-sm">
                                        <ImageWithFallback
                                            src={url}
                                            alt={`Hero ${index + 1}`}
                                            name={title || "Hero"}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick('existing', index)}
                                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* New Previews */}
                                {imageFiles.map((file, index) => (
                                    <div key={`new-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border border-dashed border-emerald-400 bg-emerald-50/30">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">NEW</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick('new', index)}
                                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:scale-110 shadow-lg transition-transform"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#10b981] hover:bg-emerald-50 transition-all text-gray-400 hover:text-[#10b981] group">
                                    <HiOutlinePlus className="w-8 h-8 mb-1 transition-transform group-hover:scale-110" />
                                    <span className="text-xs font-semibold">Add Image</span>
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>

                </form>
            </div>

            <DeleteConfirmation
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Remove Image"
                message="Are you sure you want to remove this image from the hero slider? Remember to click 'Save All Changes' to persist this change."
            />
        </div>
    );
}
