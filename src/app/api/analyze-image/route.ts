import { NextRequest, NextResponse } from 'next/server';
import { analyzeClothingImage } from '@/services/vision/ClothingAnalyzer';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    let imageUrl: string | undefined;
    let detectedColor: string | undefined;
    let detectedPattern: string | undefined;
    let detectedGarmentHint: string | undefined;
    let aspectRatio: number | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      imageUrl = (formData.get('imageUrl') as string) || undefined;
      detectedColor = (formData.get('detectedColor') as string) || undefined;
      detectedPattern = (formData.get('detectedPattern') as string) || undefined;
      detectedGarmentHint = (formData.get('detectedGarmentHint') as string) || undefined;

      if (file) {
        fileName = file.name;
        mimeType = file.type;
        const arrayBuf = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      }
    } else {
      const body = await req.json();
      fileName = body.fileName;
      mimeType = body.mimeType;
      imageUrl = body.imageUrl;
      detectedColor = body.detectedColor;
      detectedPattern = body.detectedPattern;
      detectedGarmentHint = body.detectedGarmentHint;
      aspectRatio = typeof body.aspectRatio === 'number' ? body.aspectRatio : undefined;

      // If a local public file was referenced
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', imageUrl);
          buffer = await fs.readFile(localPath);
        } catch {
          // Proceed without local buffer if file read fails
        }
      }
    }

    const result = await analyzeClothingImage({
      imageBuffer: buffer,
      mimeType,
      fileName,
      imageUrl,
      detectedColor,
      detectedPattern,
      detectedGarmentHint,
      aspectRatio,
    });

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Error analyzing clothing image:', error);
    return NextResponse.json(
      { success: false, error: 'Image analysis could not be completed. Please enter details manually.' },
      { status: 500 }
    );
  }
}
