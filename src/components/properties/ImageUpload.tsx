import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
    imageUrl?: string;
    onChange: (url?: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ imageUrl, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3">

            <div className="flex flex-col gap-3">

                {imageUrl ? (
                    <div className="relative group overflow-hidden rounded-[var(--radius-lg)] border border-slate-200">
                        <img src={imageUrl} className="w-full h-32 object-cover opacity-90" alt="attached" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onChange(undefined)}
                                className="rounded-[var(--radius-sm)] bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-slate-300 py-6 text-sm text-slate-500 transition-all hover:border-indigo-400 hover:bg-slate-50 hover:text-indigo-600"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Click to Upload Image</span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>
        </div>
    );
};
