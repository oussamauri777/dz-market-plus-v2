'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
    fallbackSrc?: string;
}

export default function ImageWithFallback({
    src,
    alt,
    fallbackSrc = 'https://dummyimage.com/600x400/f3f4f6/9ca3af&text=No+Image',
    ...props
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
        setError(false);
    }, [src]);

    if (error) {
        // Fallback to standard img tag if next/image fails (e.g. domain not whitelisted)
        // or if the image itself is broken.
        // We try the original src with a standard img tag first (in case it was just a domain whitelist issue)
        // If that fails, we show the fallback placeholder.
        return (
            <img
                src={typeof src === 'string' ? src : fallbackSrc}
                alt={alt}
                className={props.className}
                onError={(e) => {
                    // If even the standard img tag fails, show the placeholder
                    e.currentTarget.src = fallbackSrc;
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: (props.style?.objectFit as any) || 'cover',
                }}
            />
        );
    }

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => setError(true)}
        />
    );
}
