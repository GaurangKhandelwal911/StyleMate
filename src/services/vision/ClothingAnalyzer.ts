import { IVisionProvider, VisionAnalysisInput } from './VisionProvider';
import { MockVisionProvider } from './MockVisionProvider';
import { GeminiVisionProvider } from './GeminiVisionProvider';
import { ClipVisionProvider } from './ClipVisionProvider';
import { VisionAnalysisResult } from '@/types';

class ClothingAnalyzerService {
  private provider: IVisionProvider;

  constructor() {
    const configuredProvider = process.env.AI_VISION_PROVIDER?.toLowerCase();
    if (configuredProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      this.provider = new GeminiVisionProvider();
    } else {
      this.provider = new ClipVisionProvider();
    }
  }

  public setProvider(provider: IVisionProvider) {
    this.provider = provider;
  }

  public async analyzeClothingImage(input: VisionAnalysisInput): Promise<VisionAnalysisResult> {
    try {
      const result = await this.provider.analyzeImage(input);
      // Ensure fallback safety if any field is missing
      return {
        category: result.category || 'Tops',
        type: result.type || 'Shirt',
        color: result.color || 'White',
        pattern: result.pattern || 'Solid',
        material: result.material || 'Cotton',
        fit: result.fit ?? 'Regular',
        style: result.style || 'Casual',
        occasions: result.occasions && result.occasions.length > 0 ? result.occasions : ['Casual'],
        seasons: result.seasons && result.seasons.length > 0 ? result.seasons : ['All Season'],
        brand: result.brand || null,
        confidence: Math.min(Math.max(result.confidence || 0.9, 0.5), 0.99),
        suggestedName: result.suggestedName || `${result.color} ${result.type}`,
        uncertainFields: result.uncertainFields || [],
      };
    } catch (error) {
      console.error('Error during clothing image analysis, returning safe fallback:', error);
      const fallback = new MockVisionProvider();
      return fallback.analyzeImage(input);
    }
  }
}

export const clothingAnalyzer = new ClothingAnalyzerService();
export const analyzeClothingImage = (input: VisionAnalysisInput) => clothingAnalyzer.analyzeClothingImage(input);
