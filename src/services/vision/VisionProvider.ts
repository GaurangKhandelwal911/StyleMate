import { VisionAnalysisResult } from '@/types';

export interface VisionAnalysisInput {
  imageBuffer?: Buffer;
  mimeType?: string;
  fileName?: string;
  imageUrl?: string;
  detectedColor?: string;
  detectedPattern?: string;
  detectedGarmentHint?: string;
  aspectRatio?: number;
}

export interface IVisionProvider {
  name: string;
  analyzeImage(input: VisionAnalysisInput): Promise<VisionAnalysisResult>;
}
