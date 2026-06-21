'use client';

import * as React from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Search, Check, FolderOpen } from 'lucide-react';
import { getMediaFiles, uploadMediaFile, type MediaFile } from '@/lib/admin-actions';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  bucket?: 'product-images' | 'banners';
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  bucket: defaultBucket = 'product-images',
}: MediaPickerProps) {
  const [media, setMedia] = React.useState<MediaFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bucket, setBucket] = React.useState(defaultBucket);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const files = await getMediaFiles();
        if (!cancelled) setMedia(files);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', bucket);
        const result = await uploadMediaFile(fd);
        setMedia((prev) => [result as MediaFile, ...prev]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) next.clear();
        next.add(url);
      }
      return next;
    });
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch('');
    onClose();
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    handleClose();
  };

  const filtered = media.filter((f) => {
    const matchesBucket = f.bucket === bucket;
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">Media Library</h3>
          <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-gray-400" />
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as typeof bucket)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            >
              <option value="product-images">Product Images</option>
              <option value="banners">Banners</option>
            </select>
          </div>

          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#C9A84C] rounded-lg cursor-pointer hover:bg-[#C9A84C]/90 transition-colors">
            <Upload className="size-4" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                {media.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isSelected = selected.has(item.url);
                return (
                  <div
                    key={item.id}
                    className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelect(item.url)}
                  >
                    <Image
                      src={item.url}
                      alt={item.name}
                      fill
                      unoptimized
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Selection indicator */}
                    <div className={`absolute top-2 left-2 z-20 size-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#C9A84C] text-white'
                        : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      <Check className="size-3.5" />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] font-medium text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-white/60">{item.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} files`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-medium text-white bg-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiple ? `Select (${selected.size})` : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
