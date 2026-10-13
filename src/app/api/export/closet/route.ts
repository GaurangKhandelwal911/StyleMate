import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { ExcelExportService } from '@/services/export/ExcelExportService';
import { ExcelExportOptions } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    let options: ExcelExportOptions = {
      itemDetails: true,
      availabilityStatus: true,
      imageLinks: true,
      notes: true,
      outfitHistory: true,
      availabilityHistory: true,
    };

    try {
      const body = await req.json();
      options = { ...options, ...body };
    } catch {
      // Use defaults if empty
    }

    // Fetch items
    const rawItems = await prisma.closetItem.findMany({
      where: { userId: user.id },
      orderBy: { category: 'asc' },
    });

    const items = rawItems.map((item) => ({
      ...item,
      status: item.status as any,
      occasions: JSON.parse(item.occasions || '[]'),
      seasons: JSON.parse(item.seasons || '[]'),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      lastWornAt: item.lastWornAt ? item.lastWornAt.toISOString() : null,
      unavailableUntil: item.unavailableUntil ? item.unavailableUntil.toISOString() : null,
    }));

    // Fetch outfit history
    const historyLogs = await prisma.outfitHistory.findMany({
      where: { userId: user.id },
      include: {
        outfit: {
          include: {
            items: {
              include: {
                closetItem: true,
              },
            },
          },
        },
      },
      orderBy: { wornAt: 'desc' },
    });

    const formattedHistory = historyLogs.map((h) => ({
      id: h.id,
      wornAt: h.wornAt.toISOString(),
      occasion: h.outfit.occasion,
      style: h.outfit.style,
      items: h.outfit.items.map((i) => i.closetItem.name).join(' + '),
      score: h.outfit.score,
    }));

    // Fetch availability logs
    const availabilityLogs = await prisma.availabilityRecord.findMany({
      include: {
        closetItem: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const formattedAvailLogs = availabilityLogs.map((a) => ({
      itemId: a.closetItemId,
      itemName: a.closetItem.name,
      status: a.status,
      reason: a.reason || 'None',
      startDate: a.startDate.toISOString(),
      endDate: a.endDate ? a.endDate.toISOString() : undefined,
    }));

    const buffer = ExcelExportService.generateClosetWorkbook({
      items,
      history: formattedHistory,
      availabilityLogs: formattedAvailLogs,
      options,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="StyleMate_Closet_Export.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate Excel export' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Allow direct GET download with defaults
  return POST(req);
}
