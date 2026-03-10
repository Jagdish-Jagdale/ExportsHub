import React from 'react';
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

export default function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemLabel = "",
    loading = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        {/* Warning Icon */}
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <HiOutlineExclamation className="h-8 w-8" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {title}
                        </h3>

                        <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
                            {message}
                            {itemLabel && <span className="block mt-2 font-bold text-gray-900">"{itemLabel}"</span>}
                        </p>

                        <div className="flex w-full gap-3 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                                {loading ? 'Deleting...' : 'Delete Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
