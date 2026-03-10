import React, { useState } from 'react';

/**
 * A reusable image component that displays the first letter of a name 
 * if the image fails to load or the source is missing.
 */
export default function ImageWithFallback({
    src,
    alt,
    name = "",
    className = "",
    ...props
}) {
    const [error, setError] = useState(false);

    // Filter out object-fit classes from className to manage them internally
    const layoutClasses = className.replace(/object-\w+/, '').trim();

    if (error || !src) {
        return (
            <img
                src="/no-image.png"
                alt="No image available"
                className={`object-contain bg-gray-50 p-4 ${layoutClasses}`}
                {...props}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`object-cover ${className}`}
            onError={() => setError(true)}
            {...props}
        />
    );
}
