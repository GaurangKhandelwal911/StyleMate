'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Table,
  Layers,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ExportPage() {
  const { success, error: toastError } = useToast();

  const [options, setOptions] = useState({
    itemDetails: true,
    availabilityStatus: true,
    imageLinks: true,
    notes: true,
    outfitHistory: true,
    availabilityHistory: true,
  });

  const [isExporting, setIsExporting] = useState(false);

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export/closet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        throw new Error('Export generation failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StyleMate_Closet_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success(
        'Excel Export Downloaded',
        'Your complete wardrobe spreadsheet has been generated in .xlsx format.'
      );
    } catch (err) {
      console.error(err);
      toastError('Export Failed', 'Could not generate the Excel workbook. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
          Data Portability & Backup
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413] mt-0.5">
          Export Your Closet
        </h1>
        <p className="text-xs sm:text-sm text-[#686561] mt-1">
          Download your complete wardrobe data whenever you want. Exports as a genuine multi-sheet Excel workbook (.xlsx).
        </p>
      </div>

      {/* Main card */}
      <div className="bg-[#FFFFFF] border border-[#EAE4D7] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Preview banner */}
        <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E5DECF] flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DDD5C7] flex items-center justify-center text-[#47583D] shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#151413]">
              Formatted Excel Workbook (.xlsx)
            </h3>
            <p className="text-xs text-[#686561] leading-relaxed">
              Contains Sheet 1 (Full Closet Inventory), Sheet 2 (Outfit Wear History), and Sheet 3 (Availability Audit Trail).
            </p>
          </div>
        </div>

        {/* Checkbox options */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#151413]">
            Include in Export
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Item Details */}
            <label
              onClick={() => toggleOption('itemDetails')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.itemDetails
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.itemDetails}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Clothing Item Details</span>
                <span className="text-[10px] text-[#78716C]">Category, Type, Material, Fit, Colors</span>
              </div>
            </label>

            {/* Availability Status */}
            <label
              onClick={() => toggleOption('availabilityStatus')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.availabilityStatus
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.availabilityStatus}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Availability Status</span>
                <span className="text-[10px] text-[#78716C]">Active vs Laundry/Repair reasons</span>
              </div>
            </label>

            {/* Image Links */}
            <label
              onClick={() => toggleOption('imageLinks')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.imageLinks
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.imageLinks}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Image Links</span>
                <span className="text-[10px] text-[#78716C]">Cloud and local image paths</span>
              </div>
            </label>

            {/* Notes */}
            <label
              onClick={() => toggleOption('notes')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.notes
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.notes}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Personal Notes</span>
                <span className="text-[10px] text-[#78716C]">Styling and care instructions</span>
              </div>
            </label>

            {/* Outfit History */}
            <label
              onClick={() => toggleOption('outfitHistory')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.outfitHistory
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.outfitHistory}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Outfit History Sheet</span>
                <span className="text-[10px] text-[#78716C]">Worn dates, occasions, combinations</span>
              </div>
            </label>

            {/* Availability History */}
            <label
              onClick={() => toggleOption('availabilityHistory')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                options.availabilityHistory
                  ? 'bg-[#E7ECE3] border-[#5A6E4F] text-[#2A3524]'
                  : 'bg-[#FAF8F5] border-[#EAE4D7] text-[#686561]'
              }`}
            >
              <input
                type="checkbox"
                checked={options.availabilityHistory}
                onChange={() => {}}
                className="rounded text-[#47583D] focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold block">☑ Availability History Sheet</span>
                <span className="text-[10px] text-[#78716C]">Historical downtime and repairs</span>
              </div>
            </label>
          </div>
        </div>

        {/* Download Button */}
        <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
          <span className="text-xs text-[#78716C]">Format: Microsoft Excel (.xlsx)</span>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-6 py-3 rounded-2xl bg-[#47583D] hover:bg-[#384630] text-white text-sm font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Workbook...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
