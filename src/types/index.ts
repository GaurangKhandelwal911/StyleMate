export type AvailabilityStatus = 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE' | 'REMOVED';

export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Shoes'
  | 'Accessories'
  | 'Ethnic Wear'
  | 'Dresses';

export type ClothingType =
  | 'Shirt'
  | 'T-Shirt'
  | 'Polo'
  | 'Jeans'
  | 'Trousers'
  | 'Shorts'
  | 'Chinos'
  | 'Jacket'
  | 'Hoodie'
  | 'Sweater'
  | 'Coat'
  | 'Kurta'
  | 'Sherwani'
  | 'Shoes'
  | 'Sneakers'
  | 'Loafers'
  | 'Boots'
  | 'Sandals'
  | 'Watch'
  | 'Belt'
  | 'Cap'
  | 'Hat'
  | 'Bag'
  | 'Sunglasses'
  | 'Other';

export type AvailabilityReason =
  | 'Laundry'
  | 'Repair'
  | 'Being worn'
  | 'Packed'
  | 'Loaned'
  | 'Seasonal Storage'
  | 'Other';

export type WeatherCondition = 'Auto' | 'Hot' | 'Warm' | 'Mild' | 'Cold' | 'Rainy';

export type StyleOption =
  | 'Casual'
  | 'Smart Casual'
  | 'Formal'
  | 'Streetwear'
  | 'Minimal'
  | 'Traditional'
  | 'Sporty'
  | 'Elegant';

export type OccasionOption =
  | 'College'
  | 'College Presentation'
  | 'Office'
  | 'Interview'
  | 'Date'
  | 'Party'
  | 'Wedding'
  | 'Gym'
  | 'Casual Outing'
  | 'Travel'
  | 'Dinner'
  | 'Formal Event'
  | 'Ethnic Event';

export interface ClosetItemEntity {
  id: string;
  userId: string;
  name: string;
  category: string;
  type: string;
  color: string;
  pattern: string;
  material: string;
  fit: string;
  style: string;
  occasions: string[];
  seasons: string[];
  brand?: string | null;
  status: AvailabilityStatus;
  unavailableReason?: string | null;
  unavailableUntil?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  isFavorite: boolean;
  wearCount: number;
  lastWornAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisionAnalysisResult {
  category: string;
  type: string;
  color: string;
  pattern: string;
  material: string;
  fit: string | null;
  style: string;
  occasions: string[];
  seasons: string[];
  brand: string | null;
  confidence: number; // e.g. 0.92
  suggestedName: string;
  uncertainFields: string[];
}

export interface RecommendationRequest {
  occasion: OccasionOption | string;
  date?: string;
  weather: WeatherCondition;
  stylePreference: StyleOption | string;
  extraPreferences?: string;
}

export interface RecommendedOutfitItem {
  role: 'TOP' | 'BOTTOM' | 'FOOTWEAR' | 'OUTERWEAR' | 'ACCESSORY';
  item: ClosetItemEntity;
}

export interface RecommendationDiagnostics {
  totalClosetItems: number;
  availableItemsCount: number;
  unavailableItemsCount: number;
  unavailableHelpfulItems: ClosetItemEntity[];
  reasonIfEmpty?: string;
}

export interface ScoredOutfitResult {
  id?: string;
  title: string;
  occasion: string;
  style: string;
  weather: string;
  score: number; // 0 - 100
  explanation: string;
  items: RecommendedOutfitItem[];
  colorHarmonyScore: number;
  occasionScore: number;
  weatherScore: number;
  styleScore: number;
  diversityScore: number;
}

export interface RecommendationResponse {
  outfits: ScoredOutfitResult[];
  diagnostics: RecommendationDiagnostics;
}

export interface ExcelExportOptions {
  itemDetails: boolean;
  availabilityStatus: boolean;
  imageLinks: boolean;
  notes: boolean;
  outfitHistory: boolean;
  availabilityHistory: boolean;
}

export interface WardrobeAnalytics {
  totalItems: number;
  availableCount: number;
  unavailableCount: number;
  favoriteCount: number;
  totalOutfitsGenerated: number;
  totalOutfitsWorn: number;
  categoryDistribution: { category: string; count: number; percentage: number }[];
  colorDistribution: { color: string; count: number }[];
  styleDistribution: { style: string; count: number }[];
  mostWornItems: ClosetItemEntity[];
  recentlyWornHistory: {
    id: string;
    wornAt: string;
    outfitTitle: string;
    occasion: string;
    itemNames: string[];
  }[];
  unavailableSummary: {
    reason: string;
    count: number;
    items: { id: string; name: string; until?: string | null }[];
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  gender: string;
  complexion: string;
  height: string;
  preferredStyles: string[];
  preferredColors: string[];
  dislikedColors: string[];
  preferredFit: string;
  otherPreferences?: string | null;
}
