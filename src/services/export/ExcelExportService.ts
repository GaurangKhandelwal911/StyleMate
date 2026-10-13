import * as XLSX from 'xlsx';
import { ClosetItemEntity, ExcelExportOptions } from '@/types';

export interface OutfitHistoryExportRow {
  id: string;
  wornAt: string;
  occasion: string;
  style: string;
  items: string;
  score: number;
}

export interface AvailabilityHistoryExportRow {
  itemId: string;
  itemName: string;
  status: string;
  reason: string;
  startDate: string;
  endDate?: string;
}

export class ExcelExportService {
  public static generateClosetWorkbook(params: {
    items: ClosetItemEntity[];
    history: OutfitHistoryExportRow[];
    availabilityLogs: AvailabilityHistoryExportRow[];
    options: ExcelExportOptions;
  }): Buffer {
    const { items, history, availabilityLogs, options } = params;
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Closet
    const closetData = items.map((item) => {
      const row: Record<string, unknown> = {
        'Item ID': item.id,
        'Name': item.name,
      };

      if (options.itemDetails) {
        row['Category'] = item.category;
        row['Type'] = item.type;
        row['Color'] = item.color;
        row['Pattern'] = item.pattern;
        row['Material'] = item.material;
        row['Fit'] = item.fit;
        row['Style'] = item.style;
        row['Occasions'] = Array.isArray(item.occasions) ? item.occasions.join(', ') : item.occasions;
        row['Seasons'] = Array.isArray(item.seasons) ? item.seasons.join(', ') : item.seasons;
        row['Brand'] = item.brand || 'N/A';
      }

      if (options.availabilityStatus) {
        row['Availability'] = item.status === 'AVAILABLE' ? 'Available' : 'Temporarily Unavailable';
        row['Unavailable Reason'] = item.unavailableReason || 'None';
        row['Available Until'] = item.unavailableUntil ? new Date(item.unavailableUntil).toLocaleDateString() : 'N/A';
      }

      if (options.notes) {
        row['Notes'] = item.notes || '';
      }

      if (options.imageLinks) {
        row['Image URL'] = item.imageUrl || 'No image';
      }

      row['Wear Count'] = item.wearCount;
      row['Date Added'] = new Date(item.createdAt).toLocaleDateString();

      return row;
    });

    const closetSheet = XLSX.utils.json_to_sheet(closetData);
    XLSX.utils.book_append_sheet(workbook, closetSheet, 'Closet');

    // Sheet 2: Outfit History
    if (options.outfitHistory) {
      const historyData = history.map((h) => ({
        'Outfit ID': h.id,
        'Date': new Date(h.wornAt).toLocaleDateString(),
        'Occasion': h.occasion,
        'Style': h.style,
        'Items': h.items,
        'Compatibility Score': `${h.score}%`,
      }));

      const historySheet = XLSX.utils.json_to_sheet(
        historyData.length > 0
          ? historyData
          : [{ 'Message': 'No outfit wear history recorded yet.' }]
      );
      XLSX.utils.book_append_sheet(workbook, historySheet, 'Outfit History');
    }

    // Sheet 3: Availability History
    if (options.availabilityHistory) {
      const availData = availabilityLogs.map((a) => ({
        'Item ID': a.itemId,
        'Item Name': a.itemName,
        'Status': a.status === 'AVAILABLE' ? 'Available' : 'Temporarily Unavailable',
        'Reason': a.reason || 'None',
        'Start Date': new Date(a.startDate).toLocaleDateString(),
        'End Date': a.endDate ? new Date(a.endDate).toLocaleDateString() : 'Active',
      }));

      const availSheet = XLSX.utils.json_to_sheet(
        availData.length > 0
          ? availData
          : [{ 'Message': 'No availability status transitions recorded.' }]
      );
      XLSX.utils.book_append_sheet(workbook, availSheet, 'Availability History');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer as Buffer;
  }
}
