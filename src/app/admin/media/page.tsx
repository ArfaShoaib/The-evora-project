'use client';

import * as React from 'react';
import Image from 'next/image';
import { Upload, Trash2, X, ImageIcon, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  getMediaFiles,
  uploadMediaFile,
  deleteMediaFile,
  type MediaFile,
} from '@/lib/admin-actions';

export default function MediaPage() {
  const [media, setMedia] = React.useState<MediaFile[]>([]);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MediaFile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [bucket, setBucket] = React.useState<'product-images' | 'banners'>('product-images');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const files = await getMediaFiles();
        if (!cancelled) {
          React.startTransition(() => { setMedia(files); });
        }
      } catch {
        // Storage not configured or no access
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const path = deleteTarget.id.replace(`${deleteTarget.bucket}/`, '');
      await deleteMediaFile(deleteTarget.bucket, path);
      setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Media Library</h2>
        <p className="text-sm text-gray-500 mt-1">{media.length} files</p>
      </div>

      {/* Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <FolderOpen className="size-4 text-gray-400" />
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as typeof bucket)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            >
              <option value="product-images">Product Images</option>
              <option value="banners">Banners</option>
            </select>
          </div>
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#C9A84C] transition-colors">
            <Upload className="size-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              {uploading ? 'Uploading...' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </CardContent>
      </Card>

      {/* Grid */}
      {media.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="size-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">No files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-200"
              onClick={() => setPreview(item.url)}
            >
              <Image
                src={item.url}
                alt={item.name}
                width={120}
                height={120}
                unoptimized
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium text-white truncate">{item.name}</p>
                <p className="text-xs text-white/60">{item.size}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setPreview(null)}>
            <X className="size-6" />
          </button>
          <Image src={preview} alt="Preview" width={1200} height={800} unoptimized className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete File</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
