'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RefreshCw,
  Trash2,
  PencilLine,
  Image as ImageIcon,
} from 'lucide-react';
import { ClosetItemEntity, ClothingCategory, ClothingType, StyleOption, OccasionOption } from '@/types';
import { useToast } from '@/components/ui/Toast';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: (item: ClosetItemEntity) => void;
  initialItem?: ClosetItemEntity | null;
}

const CATEGORIES: ClothingCategory[] = [
  'Tops',
  'Bottoms',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Ethnic Wear',
  'Dresses',
];

const TYPES_BY_CATEGORY: Record<string, string[]> = {
  Tops: ['Shirt', 'T-Shirt', 'Polo', 'Sweater', 'Other'],
  Bottoms: ['Jeans', 'Trousers', 'Chinos', 'Shorts', 'Other'],
  Outerwear: ['Jacket', 'Hoodie', 'Coat', 'Sweater', 'Other'],
  Shoes: ['Sneakers', 'Loafers', 'Shoes', 'Boots', 'Sandals', 'Other'],
  Accessories: ['Watch', 'Belt', 'Cap', 'Hat', 'Bag', 'Sunglasses', 'Other'],
  'Ethnic Wear': ['Kurta', 'Sherwani', 'Other'],
  Dresses: ['Other'],
};

const ALL_TYPES: ClothingType[] = [
  'Shirt',
  'T-Shirt',
  'Polo',
  'Jeans',
  'Trousers',
  'Shorts',
  'Chinos',
  'Jacket',
  'Hoodie',
  'Sweater',
  'Coat',
  'Kurta',
  'Sherwani',
  'Shoes',
  'Sneakers',
  'Loafers',
  'Boots',
  'Sandals',
  'Watch',
  'Belt',
  'Cap',
  'Hat',
  'Bag',
  'Sunglasses',
  'Other',
];

const STYLES: StyleOption[] = [
  'Casual',
  'Smart Casual',
  'Formal',
  'Streetwear',
  'Minimal',
  'Traditional',
  'Sporty',
  'Elegant',
];

const OCCASIONS: OccasionOption[] = [
  'College',
  'College Presentation',
  'Office',
  'Interview',
  'Date',
  'Party',
  'Wedding',
  'Gym',
  'Casual Outing',
  'Travel',
  'Dinner',
  'Formal Event',
  'Ethnic Event',
];

const SEASONS = ['Summer', 'Winter', 'Monsoon', 'All Season'];

const COLOR_SWATCHES = [
  { name: 'White', hex: '#FFFFFF', border: '#DCD6CC' },
  { name: 'Black', hex: '#18181B', border: '#18181B' },
  { name: 'Navy', hex: '#1E293B', border: '#1E293B' },
  { name: 'Blue', hex: '#3B82F6', border: '#2563EB' },
  { name: 'Beige', hex: '#D6C7B2', border: '#BBA88F' },
  { name: 'Olive', hex: '#4D5D42', border: '#3E4C35' },
  { name: 'Grey', hex: '#71717A', border: '#52525B' },
  { name: 'Brown', hex: '#6B4423', border: '#54341A' },
  { name: 'Maroon', hex: '#641E16', border: '#4A150F' },
  { name: 'Red', hex: '#DC2626', border: '#B91C1C' },
  { name: 'Green', hex: '#15803D', border: '#166534' },
  { name: 'Yellow', hex: '#EAB308', border: '#CA8A04' },
  { name: 'Pink', hex: '#EC4899', border: '#DB2777' },
];

const COMMON_PATTERNS = ['Solid', 'Striped', 'Checkered', 'Printed', 'Textured', 'Graphic', 'Washed'];
const COMMON_MATERIALS = ['Cotton', 'Denim', 'Linen', 'Wool', 'Leather', 'Polyester', 'Silk', 'Fleece', 'Suede'];

export function AddItemModal({
  isOpen,
  onClose,
  onItemSaved,
  initialItem,
}: AddItemModalProps) {
  const { success, error: toastError } = useToast();

  // Form states
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<ClothingCategory>(
    (initialItem?.category as ClothingCategory) || 'Tops'
  );
  const [type, setType] = useState<string>(initialItem?.type || 'Shirt');
  const [color, setColor] = useState(initialItem?.color || 'White');
  const [pattern, setPattern] = useState(initialItem?.pattern || 'Solid');
  const [material, setMaterial] = useState(initialItem?.material || 'Cotton');
  const [fit, setFit] = useState(initialItem?.fit || 'Regular');
  const [style, setStyle] = useState(initialItem?.style || 'Casual');
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    initialItem?.occasions || ['Casual Outing']
  );
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(
    initialItem?.seasons || ['All Season']
  );
  const [imageUrl, setImageUrl] = useState<string>(initialItem?.imageUrl || '');

  // AI Analysis & Upload state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiFilledFields, setAiFilledFields] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialItem?.imageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleSeason = (sea: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(sea) ? prev.filter((s) => s !== sea) : [...prev, sea]
    );
  };

  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Invalid file', 'Please select a JPG, PNG, or WEBP image file.');
      return;
    }

    setUploadFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);

    // Automatically upload and run real AI CLIP vision analysis to populate all fields
    await uploadAndAnalyze(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
  };

  const uploadAndAnalyze = async (file: File) => {
    setAnalyzing(true);
    try {
      // 1. Upload file to local storage
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        toastError('Upload failed', uploadData.error);
        setAnalyzing(false);
        return;
      }

      setImageUrl(uploadData.url);

      // 2. Run real OpenAI CLIP Vision Transformer analysis on the uploaded image
      const analyzeRes = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (analyzeData.success && analyzeData.analysis) {
        const a = analyzeData.analysis;
        setName(a.suggestedName || `${a.color || 'Classic'} ${a.type || 'Item'}`);
        setCategory(a.category || 'Tops');
        setType(a.type || 'Shirt');
        setColor(a.color || 'White');
        setPattern(a.pattern || 'Solid');
        setMaterial(a.material || 'Cotton');
        if (a.fit) setFit(a.fit);
        setStyle(a.style || 'Casual');
        if (a.brand) setBrand(a.brand);
        if (a.occasions && a.occasions.length) setSelectedOccasions(a.occasions);
        if (a.seasons && a.seasons.length) setSelectedSeasons(a.seasons);
        setAiConfidence(a.confidence);
        setAiFilledFields(true);

        success(
          'AI Auto-Fill Complete ✨',
          `Detected as ${a.color} ${a.type} (${Math.round(a.confidence * 100)}% match). You can edit any field below.`
        );
      }
    } catch (err) {
      console.error(err);
      toastError(
        'Analysis error',
        'Image uploaded, but AI analysis encountered an issue. You can fill or adjust the fields below.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadFile(null);
    setPreviewSrc(null);
    setImageUrl('');
    setAiConfidence(null);
    setAiFilledFields(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadFile) {
      await uploadAndAnalyze(uploadFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Validation Error', 'Please enter a name for the item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = initialItem ? `/api/closet/${initialItem.id}` : '/api/closet';
      const method = initialItem ? 'PUT' : 'POST';

      const payload = {
        name,
        category,
        type,
        color,
        pattern,
        material,
        fit,
        style,
        brand,
        notes,
        occasions: selectedOccasions,
        seasons: selectedSeasons,
        imageUrl,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(
          initialItem ? 'Item Updated' : 'Added to Closet',
          `${name} is now stored in your wardrobe.`
        );
        onItemSaved(data.item);
        onClose();
      } else {
        toastError('Failed to save item', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl max-w-2xl w-full shadow-modal overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 px-6 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FDFCF9]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#151413]">
                {initialItem ? 'Edit Clothing Item' : 'Add New Item to Closet'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7ECE3] text-[#2A3524]">
                <Sparkles className="w-3 h-3 text-[#47583D]" />
                AI Vision Enabled
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              Upload a photo so AI can auto-fill all details, then review or edit any field before saving.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8984] hover:text-[#151413] rounded-full hover:bg-[#F3EFE6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Image Upload & AI Auto-Analysis Dropzone (Replaces raw Image URL input) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#151413]">
                <ImageIcon className="w-3.5 h-3.5 text-[#47583D]" />
                <span>Clothing Photo (Upload for AI Auto-Fill)</span>
              </label>
              {previewSrc && (
                <div className="flex items-center gap-2">
                  {uploadFile && (
                    <button
                      type="button"
                      onClick={handleReAnalyze}
                      disabled={analyzing}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#47583D] hover:text-[#2A3524] bg-[#E7ECE3] px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
                      <span>Re-analyze with AI</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A13D2D] hover:bg-[#FDECEB] px-2.5 py-1 rounded-lg transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl cursor-pointer transition group relative overflow-hidden ${
                isDragging
                  ? 'border-[#47583D] bg-[#E7ECE3]/60'
                  : previewSrc
                  ? 'border-[#D2DEC9] bg-[#FAF8F5] hover:border-[#47583D] p-4'
                  : 'border-[#DDD5C7] hover:border-[#47583D] bg-[#FAF8F5] hover:bg-[#F3EFE6] p-6 text-center'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
              />

              {previewSrc ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden shadow-xs border border-[#DDD5C7] shrink-0 bg-white">
                    <Image src={previewSrc} alt="Uploaded clothing" fill className="object-cover" />
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mb-1.5 text-white" />
                        <span className="text-[11px] font-semibold leading-tight">
                          AI analyzing outfit...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7ECE3] text-[#2A3524] text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#47583D]" />
                      <span>
                        {analyzing
                          ? 'AI is detecting Category, Type, Color, Material & Style...'
                          : aiConfidence !== null
                          ? `AI Auto-Filled (${Math.round(aiConfidence * 100)}% Match)`
                          : 'Photo Attached'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#151413]">
                      {analyzing
                        ? 'Please wait a moment while we fill in the details below...'
                        : 'All fields below have been populated! Feel free to change anything.'}
                    </p>

                    <p className="text-[11px] text-[#78716C]">
                      Click anywhere in this box or drag a new file to change the uploaded image.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E7ECE3] text-[#47583D] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#151413]">
                    Click to upload photo or drag & drop here
                  </p>
                  <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto">
                    Upload JPG, PNG, or WEBP — <strong className="text-[#2A3524]">AI will automatically analyze</strong> your photo and fill in Category, Type, Color, Pattern, Material, Fit, Style & Occasions.
                  </p>
                </div>
              )}
            </div>

            {/* Editable AI Notice Banner */}
            {aiFilledFields && (
              <div className="p-3.5 rounded-2xl bg-[#E7ECE3]/80 border border-[#C5D6B8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#47583D] shrink-0" />
                  <span className="text-xs font-semibold text-[#2A3524]">
                    AI analyzed your photo and filled all fields below!
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#47583D] font-semibold">
                  <PencilLine className="w-3.5 h-3.5" />
                  Every field is 100% editable by you
                </span>
              </div>
            )}
          </div>

          {/* 2. Form Fields: All AI-populated & 100% User Editable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Item Name */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Item Name *
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D] bg-[#E7ECE3] px-2 py-0.5 rounded-md">
                    ✨ AI Suggested • Editable
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. White Oxford Cotton Shirt"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Category *
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ClothingCategory;
                  setCategory(cat);
                  const availableTypes = TYPES_BY_CATEGORY[cat] || ['Other'];
                  setType(availableTypes[0]);
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Type *
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              >
                {(TYPES_BY_CATEGORY[category] || ALL_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Color with Interactive Color Swatches + Editable Input */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Color *
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D] bg-[#E7ECE3] px-2 py-0.5 rounded-md">
                    ✨ AI Detected: {color} • Click a swatch or type to change
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7]">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = color.toLowerCase() === swatch.name.toLowerCase();
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => setColor(swatch.name)}
                      title={swatch.name}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition border ${
                        isSelected
                          ? 'bg-white border-[#47583D] text-[#151413] font-semibold shadow-2xs ring-1 ring-[#47583D]'
                          : 'bg-transparent border-transparent text-[#686561] hover:bg-white/70'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border"
                        style={{
                          backgroundColor: swatch.hex,
                          borderColor: swatch.border,
                        }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Or type any custom color (e.g. Pastel Blue, Charcoal, Mint)"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
            </div>

            {/* Pattern */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Pattern
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. Solid, Striped, Checkered"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_PATTERNS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPattern(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                      pattern.toLowerCase() === p.toLowerCase()
                        ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-semibold'
                        : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#78716C] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Material
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Cotton, Linen, Denim, Wool"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_MATERIALS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                      material.toLowerCase() === m.toLowerCase()
                        ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-semibold'
                        : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#78716C] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Fit
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              >
                <option value="Regular">Regular</option>
                <option value="Slim">Slim</option>
                <option value="Relaxed">Relaxed</option>
                <option value="Oversized">Oversized</option>
                <option value="Tailored">Tailored</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Style
                </label>
                {aiFilledFields && (
                  <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
                )}
              </div>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                  Brand (Optional)
                </label>
                {aiFilledFields && brand && (
                  <span className="text-[10px] font-medium text-[#47583D]">AI Detected • Editable</span>
                )}
              </div>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Uniqlo, Zara, Nike, H&M"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
              />
            </div>
          </div>

          {/* Occasions Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                Suitable Occasions (Click to add or remove)
              </label>
              {aiFilledFields && (
                <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((occ) => {
                const active = selectedOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      active
                        ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-semibold'
                        : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seasons Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413]">
                Seasons
              </label>
              {aiFilledFields && (
                <span className="text-[10px] font-medium text-[#47583D]">Editable</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SEASONS.map((sea) => {
                const active = selectedSeasons.includes(sea);
                return (
                  <button
                    key={sea}
                    type="button"
                    onClick={() => toggleSeason(sea)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      active
                        ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524] font-semibold'
                        : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    {sea}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#151413] mb-1">
              Personal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Iron before wearing; comfortable slim collar"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#47583D]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#686561] hover:bg-[#F7F4EE] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || analyzing}
              className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{initialItem ? 'Save Changes' : 'Add to Closet'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
