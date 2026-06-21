'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { MediaPicker } from './MediaPicker';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  bucket?: 'product-images' | 'banners';
}

export function ImageInput({ label, value, onChange, placeholder = 'https://...', bucket = 'banners' }: ImageInputProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#C9A84C] border border-[#C9A84C]/30 rounded-lg hover:bg-[#C9A84C]/5 transition-colors whitespace-nowrap"
        >
          <ImageIcon className="size-4" />
          Browse
        </button>
      </div>
      {value && (
        <div className="mt-2 relative size-16 rounded-lg overflow-hidden border border-gray-200">
          <Image src={value} alt="" fill unoptimized className="object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(urls) => { if (urls[0]) onChange(urls[0]); }}
        bucket={bucket}
      />
    </div>
  );
}
