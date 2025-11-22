'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';

interface VoiceRecorderProps {
    onRecordingComplete: (url: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await uploadAudio(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default_preset');
        formData.append('resource_type', 'video'); // Cloudinary treats audio as video often

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onRecordingComplete(data.secure_url);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload voice message.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center">
            {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : isRecording ? (
                <button
                    type="button"
                    onClick={stopRecording}
                    className="text-red-600 hover:text-red-700 focus:outline-none animate-pulse"
                    title="Stop Recording"
                >
                    <Square className="h-6 w-6 fill-current" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={startRecording}
                    className="text-gray-500 hover:text-blue-600 focus:outline-none"
                    title="Record Voice Message"
                >
                    <Mic className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
