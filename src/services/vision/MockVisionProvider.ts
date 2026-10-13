import { IVisionProvider, VisionAnalysisInput } from './VisionProvider';
import { VisionAnalysisResult } from '@/types';

const COLOR_KEYWORDS: { keyword: string; label: string }[] = [
  { keyword: 'white', label: 'White' },
  { keyword: 'black', label: 'Black' },
  { keyword: 'navy', label: 'Navy' },
  { keyword: 'blue', label: 'Blue' },
  { keyword: 'beige', label: 'Beige' },
  { keyword: 'cream', label: 'Beige' },
  { keyword: 'khaki', label: 'Beige' },
  { keyword: 'olive', label: 'Olive' },
  { keyword: 'sage', label: 'Olive' },
  { keyword: 'green', label: 'Green' },
  { keyword: 'grey', label: 'Grey' },
  { keyword: 'gray', label: 'Grey' },
  { keyword: 'brown', label: 'Brown' },
  { keyword: 'tan', label: 'Brown' },
  { keyword: 'camel', label: 'Brown' },
  { keyword: 'mustard', label: 'Brown' },
  { keyword: 'red', label: 'Red' },
  { keyword: 'maroon', label: 'Maroon' },
  { keyword: 'burgundy', label: 'Maroon' },
  { keyword: 'pink', label: 'Pink' },
  { keyword: 'yellow', label: 'Yellow' },
];

const IGNORED_CAMERA_TOKENS = new Set([
  'whatsapp',
  'image',
  'img',
  'dsc',
  'dcim',
  'screenshot',
  'screencapture',
  'capture',
  'photo',
  'pic',
  'pxl',
  'snapchat',
  'instagram',
  'telegram',
  'download',
  'at',
  'am',
  'pm',
  'jpeg',
  'jpg',
  'png',
  'webp',
]);

/**
 * Extracts clean whole-word tokens from a filename while stripping out
 * camera/app words like "WhatsApp" (which previously false-matched "hat")
 * or "ScreenCapture" (which previously false-matched "cap").
 */
function extractCleanFilenameTokens(fileName: string): Set<string> {
  const normalized = fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/t[\s_-]*shirt/g, ' tshirt ');

  const rawTokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const tokens = new Set<string>();

  for (const token of rawTokens) {
    if (!IGNORED_CAMERA_TOKENS.has(token) && !/^\d+$/.test(token)) {
      tokens.add(token);
    }
  }
  return tokens;
}

function hasAnyWord(tokens: Set<string>, candidates: string[]): boolean {
  for (const c of candidates) {
    if (tokens.has(c)) return true;
  }
  return false;
}

export class MockVisionProvider implements IVisionProvider {
  name = 'MockVisionProvider';

  async analyzeImage(input: VisionAnalysisInput): Promise<VisionAnalysisResult> {
    // Brief UX feedback delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    const tokens = extractCleanFilenameTokens(input.fileName || '');

    // 1. Determine Color:
    // Priority: real pixel-extracted color from the garment ROI -> explicit filename color word -> 'White'
    let color = input.detectedColor || 'White';
    for (const ck of COLOR_KEYWORDS) {
      if (tokens.has(ck.keyword)) {
        color = ck.label;
        break;
      }
    }

    // 2. Determine Pattern:
    // Priority: explicit filename pattern word -> pixel-detected pattern -> 'Solid'
    let pattern = input.detectedPattern || 'Solid';
    if (hasAnyWord(tokens, ['striped', 'stripe', 'stripes'])) pattern = 'Striped';
    else if (hasAnyWord(tokens, ['check', 'checked', 'checkered', 'plaid'])) pattern = 'Checkered';
    else if (hasAnyWord(tokens, ['print', 'printed', 'floral'])) pattern = 'Printed';
    else if (hasAnyWord(tokens, ['graphic', 'logo'])) pattern = 'Graphic';
    else if (hasAnyWord(tokens, ['textured', 'texture', 'knit'])) pattern = 'Textured';

    const hint = input.detectedGarmentHint;

    // 3. Footwear detection
    if (
      hasAnyWord(tokens, [
        'sneaker',
        'sneakers',
        'shoe',
        'shoes',
        'nike',
        'adidas',
        'puma',
        'loafer',
        'loafers',
        'boot',
        'boots',
        'sandal',
        'sandals',
        'trainer',
        'trainers',
      ]) ||
      hint === 'Sneakers' ||
      hint === 'Loafers' ||
      hint === 'Boots' ||
      hint === 'Sandals'
    ) {
      const isLoafer = hasAnyWord(tokens, ['loafer', 'loafers']) || hint === 'Loafers';
      const isBoot = hasAnyWord(tokens, ['boot', 'boots']) || hint === 'Boots';
      const isSandal = hasAnyWord(tokens, ['sandal', 'sandals']) || hint === 'Sandals';
      const type = isLoafer ? 'Loafers' : isBoot ? 'Boots' : isSandal ? 'Sandals' : 'Sneakers';

      return {
        category: 'Shoes',
        type,
        color,
        pattern: 'Solid',
        material: isLoafer || isBoot ? 'Leather' : 'Leather & Mesh',
        fit: 'Regular',
        style: isLoafer ? 'Smart Casual' : 'Casual',
        occasions: isLoafer
          ? ['Office', 'Dinner', 'College Presentation', 'Date']
          : ['Casual Outing', 'College', 'Travel'],
        seasons: ['All Season'],
        brand: tokens.has('nike')
          ? 'Nike'
          : tokens.has('adidas')
          ? 'Adidas'
          : tokens.has('puma')
          ? 'Puma'
          : null,
        confidence: 0.94,
        suggestedName: `${color} ${
          isLoafer ? 'Leather Loafers' : isBoot ? 'Chelsea Boots' : isSandal ? 'Comfort Sandals' : 'Minimal Sneakers'
        }`,
        uncertainFields: ['brand'],
      };
    }

    // 4. Bottoms detection (ONLY when filename has whole-word bottoms keyword OR visual classifier found two-leg bottom structure / MobileNet jeans)
    if (
      hasAnyWord(tokens, [
        'jean',
        'jeans',
        'denim',
        'pant',
        'pants',
        'trouser',
        'trousers',
        'chino',
        'chinos',
        'short',
        'shorts',
        'cargo',
        'jogger',
        'joggers',
      ]) ||
      hint === 'Jeans' ||
      hint === 'Trousers' ||
      hint === 'Shorts'
    ) {
      const isChino =
        hasAnyWord(tokens, ['chino', 'chinos']) ||
        (hint === 'Trousers' && ['Beige', 'Olive', 'Brown'].includes(color));
      const isTrouser =
        hasAnyWord(tokens, ['trouser', 'trousers', 'pant', 'pants']) ||
        (hint === 'Trousers' && !isChino);
      const isShort = hasAnyWord(tokens, ['short', 'shorts']) || hint === 'Shorts';
      const type = isShort ? 'Shorts' : isChino ? 'Chinos' : isTrouser ? 'Trousers' : 'Jeans';

      return {
        category: 'Bottoms',
        type,
        color,
        pattern: pattern === 'Graphic' ? 'Solid' : pattern,
        material: type === 'Jeans' ? 'Denim' : type === 'Trousers' ? 'Wool Blend' : 'Cotton Twill',
        fit: 'Slim',
        style: type === 'Trousers' ? 'Formal' : type === 'Chinos' ? 'Smart Casual' : 'Casual',
        occasions:
          type === 'Trousers'
            ? ['Office', 'College Presentation', 'Interview', 'Formal Event']
            : ['College', 'Casual Outing', 'Date'],
        seasons: isShort ? ['Summer'] : ['All Season'],
        brand: hasAnyWord(tokens, ['levi', 'levis']) ? "Levi's" : null,
        confidence: 0.92,
        suggestedName: `${color} ${
          type === 'Chinos'
            ? 'Slim Chinos'
            : type === 'Trousers'
            ? 'Tailored Trousers'
            : type === 'Shorts'
            ? 'Casual Shorts'
            : 'Denim Jeans'
        }`,
        uncertainFields: ['brand'],
      };
    }

    // 5. Outerwear detection
    if (
      hasAnyWord(tokens, ['jacket', 'hoodie', 'blazer', 'coat', 'sweater', 'cardigan', 'sweatshirt']) ||
      hint === 'Hoodie' ||
      hint === 'Jacket' ||
      hint === 'Sweater'
    ) {
      const isHoodie = hasAnyWord(tokens, ['hoodie', 'sweatshirt']) || hint === 'Hoodie';
      const isBlazer = hasAnyWord(tokens, ['blazer', 'coat']);
      const isSweater = hasAnyWord(tokens, ['sweater', 'cardigan']) || hint === 'Sweater';
      const type = isHoodie ? 'Hoodie' : isBlazer ? 'Coat' : isSweater ? 'Sweater' : 'Jacket';

      return {
        category: 'Outerwear',
        type,
        color,
        pattern,
        material: isHoodie
          ? 'Cotton Fleece'
          : isBlazer
          ? 'Wool Blend'
          : isSweater
          ? 'Knit Wool'
          : 'Cotton Blend',
        fit: isHoodie ? 'Relaxed' : 'Regular',
        style: isHoodie ? 'Streetwear' : isBlazer ? 'Formal' : 'Smart Casual',
        occasions: isBlazer
          ? ['College Presentation', 'Office', 'Interview', 'Formal Event']
          : ['College', 'Casual Outing', 'Travel'],
        seasons: ['Winter', 'All Season'],
        brand: null,
        confidence: 0.92,
        suggestedName: `${color} ${
          isHoodie
            ? 'Fleece Hoodie'
            : isBlazer
            ? 'Tailored Blazer'
            : isSweater
            ? 'Knit Sweater'
            : 'Casual Jacket'
        }`,
        uncertainFields: ['brand'],
      };
    }

    // 6. Ethnic wear detection
    if (hasAnyWord(tokens, ['kurta', 'sherwani', 'ethnic', 'nehru'])) {
      const isSherwani = tokens.has('sherwani');
      return {
        category: 'Ethnic Wear',
        type: isSherwani ? 'Sherwani' : 'Kurta',
        color,
        pattern,
        material: isSherwani ? 'Silk Brocade' : 'Cotton Silk',
        fit: 'Regular',
        style: 'Traditional',
        occasions: ['Wedding', 'Ethnic Event', 'Party'],
        seasons: ['All Season'],
        brand: null,
        confidence: 0.93,
        suggestedName: `${color} ${isSherwani ? 'Ceremonial Sherwani' : 'Festive Kurta'}`,
        uncertainFields: ['brand'],
      };
    }

    // 7. Accessories detection (ONLY on strict exact whole-word match or high-confidence MobileNet accessory detection)
    if (
      hasAnyWord(tokens, [
        'watch',
        'belt',
        'cap',
        'hat',
        'bag',
        'backpack',
        'sunglass',
        'sunglasses',
        'shades',
      ]) ||
      hint === 'Watch' ||
      hint === 'Bag' ||
      hint === 'Sunglasses' ||
      hint === 'Cap'
    ) {
      const isWatch = tokens.has('watch') || hint === 'Watch';
      const isBelt = tokens.has('belt');
      const isBag = hasAnyWord(tokens, ['bag', 'backpack']) || hint === 'Bag';
      const isGlass = hasAnyWord(tokens, ['sunglass', 'sunglasses', 'shades']) || hint === 'Sunglasses';
      const isHat = tokens.has('hat');
      const type = isWatch
        ? 'Watch'
        : isBelt
        ? 'Belt'
        : isBag
        ? 'Bag'
        : isGlass
        ? 'Sunglasses'
        : isHat
        ? 'Hat'
        : 'Cap';

      return {
        category: 'Accessories',
        type,
        color,
        pattern: 'Solid',
        material: isWatch
          ? 'Stainless Steel & Leather'
          : isBelt
          ? 'Full Grain Leather'
          : 'Cotton & Synthetic',
        fit: 'Regular',
        style: 'Minimal',
        occasions: ['College Presentation', 'Office', 'Date', 'Casual Outing'],
        seasons: ['All Season'],
        brand: null,
        confidence: 0.95,
        suggestedName: `${color} ${
          isWatch
            ? 'Chronograph Watch'
            : isBelt
            ? 'Leather Belt'
            : isBag
            ? 'Everyday Bag'
            : isGlass
            ? 'Classic Sunglasses'
            : 'Baseball Cap'
        }`,
        uncertainFields: ['brand'],
      };
    }

    // 8. Tops Detection (T-Shirt vs Full-Sleeves T-Shirt vs Polo vs Shirt)
    const explicitShirt = hasAnyWord(tokens, ['shirt', 'oxford', 'formal', 'button', 'linen']);
    const explicitPolo = hasAnyWord(tokens, ['polo']);
    const explicitTee = hasAnyWord(tokens, ['tshirt', 'tee', 'crewneck', 'oversized', 'graphic']);
    const isFullSleeveTee =
      hint === 'Full-Sleeves T-Shirt' ||
      hasAnyWord(tokens, ['fullsleeve', 'fullsleeves', 'longsleeve']);

    let type: 'T-Shirt' | 'Polo' | 'Shirt' = 'T-Shirt';
    if (explicitPolo || hint === 'Polo') {
      type = 'Polo';
    } else if (isFullSleeveTee || explicitTee || hint === 'T-Shirt' || pattern === 'Graphic') {
      type = 'T-Shirt';
    } else if (explicitShirt || hint === 'Shirt') {
      type = 'Shirt';
    } else {
      type = 'T-Shirt';
    }

    const isTee = type === 'T-Shirt';
    const isPolo = type === 'Polo';
    const isFormalColor = ['White', 'Navy', 'Black', 'Blue', 'Beige'].includes(color);

    let suggestedName = `${color} ${pattern !== 'Solid' ? pattern + ' ' : ''}${
      isFullSleeveTee
        ? 'Full-Sleeves Crewneck T-Shirt'
        : isTee
        ? 'Crewneck T-Shirt'
        : isPolo
        ? 'Pique Polo'
        : 'Cotton Shirt'
    }`;

    return {
      category: 'Tops',
      type,
      color,
      pattern,
      material: isFullSleeveTee ? 'Cotton Knit' : 'Cotton',
      fit: isTee && pattern === 'Graphic' ? 'Slim' : 'Regular',
      style: isTee ? 'Casual' : isFormalColor ? 'Smart Casual' : 'Casual',
      occasions: isTee
        ? ['College', 'Casual Outing', 'Travel', 'Date']
        : ['College Presentation', 'Office', 'Casual Outing', 'Date'],
      seasons: isFullSleeveTee ? ['Winter', 'All Season'] : ['Summer', 'All Season'],
      brand: null,
      confidence: 0.94,
      suggestedName,
      uncertainFields: ['brand'],
    };
  }
}
