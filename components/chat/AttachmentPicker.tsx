'use client';

import { Paperclip, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface AttachmentPickerProps {
    onUploadComplete: (url: string, type: 'image' | 'file', fileName?: string) => void;
}

export default function AttachmentPicker({ onUploadComplete }: AttachmentPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Attach File"
            >
                <Paperclip className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 min-w-[150px] border border-gray-200 z-50">
                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        options={{
                            sources: ['local', 'camera'],
                            resourceType: 'image',
                            multiple: false,
                        }}
                        onSuccess={(result: any) => {
                            onUploadComplete(result.info.secure_url, 'image', result.info.original_filename);
                            setIsOpen(false);
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700 w-full text-left"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Image
                            </button>
                        )}
                    </CldUploadWidget>

                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        options={{
                            sources: ['local'],
                            resourceType: 'raw',
                            multiple: false,
                        }}
                        onSuccess={(result: any) => {
                            onUploadComplete(result.info.secure_url, 'file', result.info.original_filename);
                            setIsOpen(false);
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700 w-full text-left"
                            >
                                <FileIcon className="h-4 w-4" />
                                Document
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            )}

            {/* Backdrop to close on click outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
