import React, { useState, useRef } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Upload,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Plus,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export default function MultipleImageUploadField({
  images = [],
  onChange,
  presets = [],
  label = 'Product Images & Gallery',
  folder = 'seafood',
  recommendedDimensions = '800 × 800 px (1:1 Square)',
  helpText = 'Upload multiple high-res photos. The first image will be the primary cover photo across shop cards and cart.',
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef(null);

  // Normalize images to array of strings
  const imageList = Array.isArray(images)
    ? images.map((img) => (typeof img === 'string' ? img : (img.publicUrl || img.url || ''))).filter(Boolean)
    : [];

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter files <= 20MB
    const validFiles = files.filter((f) => f.size <= 20 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError('Some files exceeded the 20MB size limit and were skipped.');
    } else {
      setError(null);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgressText(`Uploading and converting ${validFiles.length} photo(s) to WebP...`);

    try {
      const results = await adminService.uploadMultipleImages(validFiles, folder);
      const newUrls = (results || []).map((r) => r.url).filter(Boolean);

      if (newUrls.length > 0) {
        onChange([...imageList, ...newUrls]);
      } else {
        throw new Error('Upload completed, but no image URLs were returned.');
      }
    } catch (err) {
      console.error('Multiple image upload failed:', err);
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/uploads/')) {
      setError('Please enter a valid HTTP/HTTPS URL or /uploads/ path.');
      return;
    }

    onChange([...imageList, trimmed]);
    setUrlInput('');
    setError(null);
  };

  const handleAddPreset = (presetUrl) => {
    if (!imageList.includes(presetUrl)) {
      onChange([...imageList, presetUrl]);
    }
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const target = imageList[index];
    const remaining = imageList.filter((_, i) => i !== index);
    onChange([target, ...remaining]);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= imageList.length) return;
    const updated = [...imageList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = imageList.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {/* Hidden Multi-File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelect}
        multiple
        accept="image/png, image/jpeg, image/webp, image/avif, image/gif"
        className="hidden"
      />

      {/* Header with Counter and Dimensions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ocean-700" />
            <label className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
              {label}
            </label>
            <span className="text-[10px] font-bold bg-ocean-100 text-ocean-800 px-2 py-0.5 rounded-full">
              {imageList.length} {imageList.length === 1 ? 'Photo' : 'Photos'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{helpText}</p>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
          Recommended: {recommendedDimensions}
        </div>
      </div>

      {/* Upload Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ocean-900 hover:bg-ocean-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{uploadProgressText || 'Uploading...'}</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-sea-400" />
              <span>Upload Photos (Select Multiple)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{showPresets ? 'Hide Presets' : 'Choose from Presets'}</span>
        </button>
      </div>

      {/* Direct URL Input Row */}
      <form onSubmit={handleAddUrl} className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL (https://... or /uploads/...) and click Add"
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sea-500"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
        >
          + Add URL
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Presets Gallery Accordion */}
      {showPresets && presets.length > 0 && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Presets (Click to add to gallery):</span>
            <span className="text-[10px] text-slate-400 font-normal">Click any preset to append</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
            {presets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handleAddPreset(preset.url)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-sea-500 cursor-pointer transition shadow-2xs hover:shadow-xs"
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[9px] text-white font-bold leading-tight line-clamp-1">
                    {preset.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images Gallery Grid */}
      {imageList.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-sea-500 rounded-xl p-8 text-center bg-white cursor-pointer transition space-y-2"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:text-sea-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700">
              No product images uploaded yet
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Click to browse computer or drag & drop multiple product photos here
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {imageList.map((url, index) => {
              const isPrimary = index === 0;

              return (
                <div
                  key={index}
                  className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition flex flex-col justify-between ${
                    isPrimary
                      ? 'border-sea-600 ring-2 ring-sea-500/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                    <img
                      src={url}
                      alt={`Product Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {isPrimary ? (
                      <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Cover</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Set Cover</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Card Controls Bottom Strip */}
                  <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400 font-bold">
                      #{index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, -1)}
                          className="p-1 rounded bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {index < imageList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 1)}
                          className="p-1 rounded bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                          title="Move Right"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick "Add Another" Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-sea-500 bg-white hover:bg-sea-50/20 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-slate-400 hover:text-sea-700"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold">Add Photo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
