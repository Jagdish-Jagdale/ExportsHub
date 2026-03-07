import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';

export default function HeroManager() {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageUrls, setImageUrls] = useState([]); // Now an array
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const removeNewFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
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
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Hero Section</h1>
                <p className="text-gray-500 mt-1">Update the homepage hero slider</p>
            </div>

            <div className="max-w-3xl">
                <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Welcome to ExportsHub" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                        <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} className="input-field" rows={3} placeholder="Discover premium export products..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Slider Images</label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {/* Existing Images */}
                            {imageUrls.map((url, index) => (
                                <div key={`existing-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* New Previews */}
                            {imageFiles.map((file, index) => (
                                <div key={`new-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border border-dashed border-emerald-400">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover opacity-70" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">NEW</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeNewFile(index)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add Button */}
                            <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all text-gray-500 hover:text-emerald-600">
                                <HiOutlinePlus className="w-8 h-8 mb-1" />
                                <span className="text-xs font-medium">Add Image</span>
                                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-[11px] text-gray-400 italic mt-2">* Tip: Add multiple images to enable a 7-second auto-slider on the home page.</p>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-10 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
