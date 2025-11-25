
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
      name: 'Cupio ART Collection - Interstellar ', 
      category: Category.NAILS, 
      description: 'Oja semipermanenta ', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#Ebb0a0', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/o/j/oja-semipermanenta-cupio-art-collection-leather-dress-15ml_20256.jpg' 
    },
    { 
      id: 'n4', 
      name: 'Perfect Ruby Necklace', 
      category: Category.NAILS, 
      description: 'Oja semipermanenta ', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/p/e/perfect_ruby_necklace_c9984_c.jpg' 
    },
    { 
      id: 'n5', 
      name: 'Endless Red', 
      category: Category.NAILS, 
      description: 'Rubber Base Cupio', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/e/n/endless_red_c8890.jpg' 
    },
    { 
      id: 'n6', 
      name: 'Ruby Collection - Flirty', 
      category: Category.NAILS, 
      description: 'Rubber Base Cupio', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/o/j/oja-semipermanenta-ruby-collection-flirty_16776.jpg' 
    },
    { 
      id: 'n7', 
      name: ' Leather Dress', 
      category: Category.NAILS, 
      description: 'Oja semipermanenta Cupio ART', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/o/j/oja-semipermanenta-cupio-art-collection-future-romance-15ml_20222_1.jpg' 
    },
    { 
      id: 'n8', 
      name: ' Modern Frosted Pine ', 
      category: Category.NAILS, 
      description: 'Oja semipermanenta Cupio ART', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/m/o/modern_frosted_pine_c9981_c.jpg' 
    },
    ,
    { 
      id: 'n9', 
      name: 'Best Time Of The Year', 
      category: Category.NAILS, 
      description: 'Oja semipermanenta Cupio ART', 
      formFactor: ProductForm.BOTTLE, 
      colorHex: '#800020', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/b/e/best_time_of_the_year_c9985_c.jpg' 
    },
    // --- MAKEUP (MACHIAJ) ---
    { 
      id: 'm1', 
      name: 'Cupio Cinematic - Natural', 
      category: Category.MAKEUP, 
      description: 'Fond de ten waterproof ', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#ff99cc', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/i/cinematic_natural_c7568_d.jpg' 
    },
    { 
      id: 'm2', 
      name: 'Cupio My Peptide - Strawberry', 
      category: Category.MAKEUP, 
      description: 'Balsam de buze glossy', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#e3c2a8', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/b/a/balsam-de-buze-glossy-cupio-my-peptide-chocolate_20187_2.jpg' 
    },
    { 
      id: 'm3', 
      name: 'Fard mono Cupio', 
      category: Category.MAKEUP, 
      description: 'Eyeliner', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/9/c9554.jpg' 
    },
    { 
      id: 'm4', 
      name: 'Ruj mat Cupio Cinematic', 
      category: Category.MAKEUP, 
      description: 'Eyeliner', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/i/cinematic_matte_lipstick_nude_scene_c9194_1.jpg' 
    },
    { 
      id: 'm5', 
      name: 'Cupio Temptation - Pink', 
      category: Category.MAKEUP, 
      description: 'Bronzer pudra fata', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/t/e/temptation_pink_c6529.jpg' 
    },
    { 
      id: 'm6', 
      name: 'wonderEYES - Hollywood Glow', 
      category: Category.MAKEUP, 
      description: 'Fard de pleoape gliterat', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/w/o/wondereyes_hollywood_glow.jpg' 
    },
    { 
      id: 'm7', 
      name: 'MUAH Hype - Pastel Blue', 
      category: Category.MAKEUP, 
      description: 'Fard colorat pe baza de apa', 
      formFactor: ProductForm.TUBE, 
      colorHex: '#000000', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/8/c8909.jpg' 
    },
    // --- ACCESSORIES (ACCESORII) ---
    { 
      id: 'a1', 
      name: 'Cutie cadou Cupio - ART', 
      category: Category.ACCESSORIES, 
      description: 'Gift Set', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#ffcfcf', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/u/cutie_c9384.jpg' 
    },
    { 
      id: 'a2', 
      name: 'Magnet Cupio The Season of You', 
      category: Category.ACCESSORIES, 
      description: 'Magnet Cupio', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#333333', 
      imageUrl: 'https://dima-ai.com/magnetcp.png' 
    },
    { 
      id: 'a3', 
      name: 'Breloc pentru geanta si chei ', 
      category: Category.ACCESSORIES, 
      description: 'Gift Set', 
      formFactor: ProductForm.JAR, 
      colorHex: '#FF69B4', 
      imageUrl: 'https://dima-ai.com/breloccp.png' 
    },
    { 
      id: 'a4', 
      name: 'Set 8 pensule ', 
      category: Category.ACCESSORIES, 
      description: 'Gift Set', 
      formFactor: ProductForm.TOOL, 
      colorHex: '#ffffff', 
      imageUrl: 'https://cdn.cupio.ro/media/catalog/product/cache/a68930dbf4bc7bd59b3c7cc34c1d83d6/c/9/c9764_e.jpg' 
    }
  ],
  groundingUrls: ["https://www.cupio.ro"]
};

// POWER-UP DEFINITIONS
export const POWERUP_HEART: Product = {
  id: 'powerup-heart',
  name: '❤️ Extra Life',
  category: Category.ACCESSORIES,
  description: 'Power-up: +1 Life',
  formFactor: ProductForm.TOOL,
  colorHex: '#FF0066',
  imageUrl: '',
  specialType: 'HEART'
};

export const POWERUP_CLOCK: Product = {
  id: 'powerup-clock',
  name: '⏰ Slow Time',
  category: Category.ACCESSORIES,
  description: 'Power-up: Slow down for 2 seconds',
  formFactor: ProductForm.TOOL,
  colorHex: '#4169E1',
  imageUrl: '',
  specialType: 'CLOCK'
};