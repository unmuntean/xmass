
import { Category, ProductForm, Product } from "./types";

export const CUPIO_RED = "#800020"; // Burgundy
export const CUPIO_GOLD = "#FFD700";

// FESTIVE COLOR PALETTE
export const CATEGORY_CONFIG = {
  [Category.NAILS]: {
    label: "Unghii",
    color: "bg-red-800",
    borderColor: "border-red-500",
    textColor: "text-red-200",
    shadow: "shadow-red-500/50",
    icon: "💅",
    description: "Oje, Geluri, Rubber Base"
  },
  [Category.MAKEUP]: {
    label: "Machiaj",
    color: "bg-yellow-600",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-100",
    shadow: "shadow-yellow-500/50",
    icon: "💋",
    description: "Rujuri, Gloss, Eyeliner"
  },
  [Category.ACCESSORIES]: {
    label: "Accesorii",
    color: "bg-emerald-800",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-200",
    shadow: "shadow-emerald-500/50",
    icon: "✨",
    description: "Pensule, Lampe, Bureți"
  }
};

// Special Voucher Product Definition
export const VOUCHER_PRODUCT: Product = {
  id: 'voucher_gold',
  name: 'VOUCHER CADOU -15%',
  category: Category.ACCESSORIES, // Fallback category, but logic handles it as wildcard
  description: 'Cupon de reducere valabil pe Cupio.ro',
  formFactor: ProductForm.PALETTE,
  colorHex: '#FFD700',
  imageUrl: '', // Will use CSS generation
  specialType: 'VOUCHER'
};

export const FALLBACK_DATA = {
  title: "The Season of You",
  description: "Descoperă noua colecție de iarnă Cupio. Oferă-ți încredere!",
  products: [
    // --- NAILS (UNGHII) ---
    { 
      id: 'n1', 
      name: 'Rubber base French Collection - Blush 15ml', 
      category: Category.NAILS, 
      description: 'Rubber Base', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#Ebb0a0', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/b/l/blush_931229132_1.jpg' 
    },
    { 
      id: 'n4', 
      name: 'Rubber Base Cupio Timeless Collection - Ruby Love 15ml', 
      category: Category.NAILS, 
      description: 'Rubber Base', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/r/u/ruby_love_c8891.jpg' 
    },
    
    // --- MAKEUP (MACHIAJ) ---
    { 
      id: 'm1', 
      name: 'Balsam de buze glossy Cupio My Peptide', 
      category: Category.MAKEUP, 
      description: 'Lip Balm', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#ff99cc', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/j/p/jpg_9_27.jpg' 
    },
    { 
      id: 'm2', 
      name: 'Luciu de buze Cupio Wet Lips', 
      category: Category.MAKEUP, 
      description: 'Lip Gloss', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#e3c2a8', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/j/p/jpg_4_2.jpg' 
    },
    { 
      id: 'm3', 
      name: 'Eyeliner cu doua capete Ribells Double Dare', 
      category: Category.MAKEUP, 
      description: 'Eyeliner', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/9/c9800_c.jpg' 
    },

    // --- ACCESSORIES (ACCESORII) ---
    { 
      id: 'a1', 
      name: 'Burete pentru machiaj Cupio Cinematic - Big Screen', 
      category: Category.ACCESSORIES, 
      description: 'Makeup Tool', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#ffcfcf', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/x/l/xl_c9569_1.jpg' 
    },
    { 
      id: 'a2', 
      name: 'Magnet Cupio The Season of You', 
      category: Category.ACCESSORIES, 
      description: 'Nail Tool', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#333333', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/j/p/jpg_9_42.jpg' 
    },
    { 
      id: 'a3', 
      name: 'Cutie accesorii machiaj si unghii pentru copii Martinelia', 
      category: Category.ACCESSORIES, 
      description: 'Gift Set', 
      formFactor: ProductForm.JAR, 
      colorHex: '#FF69B4', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/7/c7354_2.jpg' 
    },
    { 
      id: 'a4', 
      name: 'Lampa led unghii Cupio Half Moon', 
      category: Category.ACCESSORIES, 
      description: 'Device', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#ffffff', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/l/a/lampa_cupio_sun_b.jpg' 
    }
  ],
  groundingUrls: ["https://www.cupio.ro"]
};