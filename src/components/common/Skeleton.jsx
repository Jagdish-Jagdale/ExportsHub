import React from 'react';

/**
 * A reusable Skeleton component with a pulse animation.
 */
export default function Skeleton({ className = "" }) {
    return (
        <div
            className={`bg-gray-100 animate-pulse rounded-lg bg-cover bg-center ${className}`}
            style={{ backgroundImage: "url('/skeleton.png')" }}
            aria-hidden="true"
        />
    );
}
