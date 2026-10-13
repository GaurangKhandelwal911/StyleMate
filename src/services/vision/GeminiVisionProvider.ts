import { IVisionProvider, VisionAnalysisInput } from './VisionProvider';
import { VisionAnalysisResult } from '@/types';
import { MockVisionProvider } from './MockVisionProvider';

export class GeminiVisionProvider implements IVisionProvider {
  name = 'GeminiVisionProvider';
  private fallbackProvider = new MockVisionProvider();

  async analyzeImage(input: VisionAnalysisInput): Promise<VisionAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !input.imageBuffer) {
      return this.fallbackProvider.analyzeImage(input);
    }

    try {
      const base64Data = input.imageBuffer.toString('base64');
      const mimeType = input.mimeType || 'image/jpeg';

      const prompt = `Analyze this clothing, shoe, or fashion accessory item. 
Return STRICT JSON ONLY with the following schema:
{
  "category": "Tops" | "Bottoms" | "Outerwear" | "Shoes" | "Accessories" | "Ethnic Wear" | "Dresses",
  "type": "Shirt" | "T-Shirt" | "Polo" | "Jeans" | "Trousers" | "Shorts" | "Chinos" | "Jacket" | "Hoodie" | "Sweater" | "Coat" | "Kurta" | "Sherwani" | "Shoes" | "Sneakers" | "Loafers" | "Boots" | "Sandals" | "Watch" | "Belt" | "Cap" | "Hat" | "Bag" | "Sunglasses" | "Other",
  "color": "White" | "Black" | "Navy" | "Beige" | "Olive" | "Grey" | "Brown" | "Blue" | "Red" | "Green" | "Other",
  "pattern": "Solid" | "Striped" | "Plaid" | "Textured" | "Graphic" | "Printed",
  "material": "Cotton" | "Linen" | "Denim" | "Wool" | "Leather" | "Silk" | "Synthetic" | "Other",
  "fit": "Regular" | "Slim" | "Relaxed" | "Oversized" | "Tailored" | null,
  "style": "Casual" | "Smart Casual" | "Formal" | "Streetwear" | "Minimal" | "Traditional" | "Sporty" | "Elegant",
  "occasions": string[], // from ["Casual", "College", "Office", "Interview", "Date", "Party", "Wedding", "Gym", "Dinner"]
  "seasons": string[], // from ["Summer", "Winter", "Monsoon", "All Season"]
  "brand": string | null,
  "confidence": number, // between 0.70 and 0.99
  "suggestedName": string,
  "uncertainFields": string[]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn('Gemini vision API returned non-OK, falling back to mock provider:', response.status);
        return this.fallbackProvider.analyzeImage(input);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return this.fallbackProvider.analyzeImage(input);
      }

      const parsed = JSON.parse(text);
      return {
        category: parsed.category || 'Tops',
        type: parsed.type || 'Shirt',
        color: parsed.color || 'White',
        pattern: parsed.pattern || 'Solid',
        material: parsed.material || 'Cotton',
        fit: parsed.fit || 'Regular',
        style: parsed.style || 'Casual',
        occasions: Array.isArray(parsed.occasions) && parsed.occasions.length ? parsed.occasions : ['Casual'],
        seasons: Array.isArray(parsed.seasons) && parsed.seasons.length ? parsed.seasons : ['All Season'],
        brand: parsed.brand || null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92,
        suggestedName: parsed.suggestedName || `${parsed.color} ${parsed.type}`,
        uncertainFields: Array.isArray(parsed.uncertainFields) ? parsed.uncertainFields : [],
      };
    } catch (err) {
      console.warn('Failed to analyze with Gemini vision, falling back to mock provider:', err);
      return this.fallbackProvider.analyzeImage(input);
    }
  }
}
