
export enum Category {
  NAILS = 'NAILS',
  MAKEUP = 'MAKEUP',
  ACCESSORIES = 'ACCESSORIES'
}

export enum ProductForm {
  BOTTLE = 'BOTTLE',      // Polishes, Foundations
  JAR = 'JAR',            // Gels, Creams
  TUBE = 'TUBE',          // Lipsticks, Mascaras
  PALETTE = 'PALETTE',    // Eyeshadows
  TOOL = 'TOOL'           // Brushes, Files
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  formFactor: ProductForm;
  colorHex: string; 
  imageUrl: string; // URL for the product image
  specialType?: 'VOUCHER'; // New field for special items
}

export interface CampaignData {
  title: string;
  description: string;
  products: Product[];
  groundingUrls: string[];
}

export interface CollectedItem {
  product: Product;
  count: number;
}

export interface GameStats {
  finalScore: number;
  collected: { [key in Category]: number };
  bestStreak: number;
  collectedItems: CollectedItem[];
}

export interface HighScoreEntry {
  name: string;
  score: number;
  date: number;
}

export enum GameState {
  INIT = 'INIT',
  LOADING = 'LOADING',
  MENU = 'MENU',
  TUTORIAL = 'TUTORIAL',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}