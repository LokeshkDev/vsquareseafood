import React, { useState, useRef } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Upload,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  X,
} from 'lucide-react';

export default function ImageUploadField({
  value = '',
  onChange,
  presets = [],
  label = 'Image',
  aspectRatio = 'square', // 'square' | 'banner'
  helpText = 'Upload from computer, enter URL, or select a preset',
  required = false,
  folder = 'catalog',
  recommendedDimensions,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploadStorage, setUploadStorage] = useState(null);
  const fileInputRef = useRef(null);

  const targetDimensions = recommendedDimensions || (
    aspectRatio === 'banner' || ['banners', 'hero', 'delivery'].includes(folder.toLowerCase())
      ? '1920 × 1080 px (16:9 Widescreen)'
      : folder.toLowerCase() === 'categories'
      ? '600 × 600 px (1:1 Square)'
      : '800 × 800 px (1:1 Square)'
  );

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await adminService.uploadImage(file, folder);
      if (result?.url) {
        setUploadStorage(result.storage || (result.url.startsWith('/uploads/') ? 'LOCAL_DISK' : 'CLOUDFLARE_R2'));
        onChange(result.url);
      } else {
        throw new Error('Upload completed but no image URL was returned.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Failed to upload image. Please try again or use a web URL.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = async () => {
    if (value && (value.startsWith('/uploads/') || value.includes('r2.cloudflarestorage.com') || value.includes('.r2.dev'))) {
      try {
        await adminService.deleteImage(value);
      } catch (e) {
        // Continue clearing
      }
    }
    onChange('');
    setError(null);
    setUploadStorage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/avif, image/gif"
        className="hidden"
      />

      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="block font-bold text-slate-700 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`font-semibold cursor-pointer ${
              mode === 'upload' ? 'text-ocean-700 underline font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            File Upload
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`font-semibold cursor-pointer ${
              mode === 'url' ? 'text-ocean-700 underline font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Web URL
          </button>
        </div>
      </div>

      {/* Recommended Size & Dimensions Helper Badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-[3px] border border-slate-200 flex items-center gap-1">
          <span>📐 Target Dimensions:</span>
          <strong className="text-slate-900">{targetDimensions}</strong>
        </span>
        <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-[3px] border border-emerald-200 flex items-center gap-1">
          <span>⚡ Max 20MB &rarr; Auto-Compressed to WebP (KB size)</span>
        </span>
      </div>

      {helpText && <p className="text-[10px] text-slate-400 -mt-1">{helpText}</p>}

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-[5px] text-[11px] text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            ✕
          </button>
        </div>
      )}

      {/* When Image Exists: Preview Card with Replace & Delete Options */}
      {value ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[5px] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group shrink-0">
            <img
              src={value}
              alt="Preview"
              className={`object-cover rounded-[5px] border border-slate-200 bg-white ${
                aspectRatio === 'banner' ? 'w-full sm:w-36 h-20' : 'w-16 h-16'
              }`}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
              <CheckCircle className="w-3 h-3" />
            </span>
          </div>

          <div className="flex-1 min-w-0 w-full text-center sm:text-left">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
              <span className="text-[11px] font-bold text-slate-800 truncate max-w-[200px]" title={value}>
                {value.startsWith('data:')
                  ? 'Uploaded Image (Data)'
                  : value.split('/').pop() || 'Selected Image'}
              </span>
              {value.includes('r2.cloudflarestorage.com') || value.includes('.r2.dev') || uploadStorage === 'CLOUDFLARE_R2' ? (
                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-[3px] border border-sky-300 shrink-0">
                  Cloudflare R2
                </span>
              ) : value.startsWith('/uploads/') || uploadStorage === 'LOCAL_DISK' ? (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-[3px] border border-amber-300 shrink-0">
                  Local Disk
                </span>
              ) : (
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-[3px] border border-slate-200 shrink-0">
                  Web URL
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{value}</div>

            {/* Action Buttons: Replace & Delete */}
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleTriggerFileSelect}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 border border-ocean-200 rounded-[4px] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteImage}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[4px] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>

              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* When No Image Exists: Upload Dropzone or URL Input */
        <div className="space-y-2">
          {mode === 'upload' ? (
            <div
              onClick={handleTriggerFileSelect}
              className={`p-4 border-2 border-dashed border-slate-300 hover:border-ocean-500 bg-slate-50/60 hover:bg-ocean-50/40 rounded-[5px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                uploading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin text-ocean-600 mb-1.5" />
                  <span className="text-xs font-bold text-ocean-800">Uploading Image to Server...</span>
                  <span className="text-[10px] text-slate-400">Saving file to live uploads directory</span>
                </>
              ) : (
                <>
                  <div className="p-2 bg-white rounded-full border border-slate-200 shadow-xs mb-1.5 text-ocean-700">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Click to Upload Image from Computer</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Target: <strong>{targetDimensions}</strong> · PNG, JPG, WEBP (Max 20MB &rarr; WebP)
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={`https://images.unsplash.com/... (Target: ${targetDimensions})`}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-mono text-[11px]"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Chooser (If provided) */}
      {presets.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-slate-400 font-bold block mb-1">Quick Stock Presets:</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`px-2 py-0.5 text-[10px] rounded-[3px] border transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-ocean-100 text-ocean-900 border-ocean-300 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
