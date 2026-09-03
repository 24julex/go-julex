// ============================================================
// GO JULEX — SINGLE SOURCE OF TRUTH FOR STOREFRONT THEMES
// Both the Merchant console (Channels → Themes) and the Super
// Admin master themes page derive their catalogs from this
// registry, which is generated from HARMONIOUS_THEME_PRESETS.
// Every theme features 100% real topic-specific Pinterest
// photography tailored to its domain vertical and color palette.
// ============================================================
import { HARMONIOUS_THEME_PRESETS } from '../pages/admin/channels/AdminThemeBuilder';

// High-resolution real Pinterest photography catalog (i.pinimg.com CDN)
// ============================================================
// Per-theme preview imagery - LOCAL files served from
// public/theme-images/ (hotlinked CDNs break previews).
// ============================================================
export const THEME_META = {
  preset_soft_peach: {
    brandName: 'Aura Haute Atelier',
    tagline: 'Haute Couture & Bespoke Eveningwear',
    aesthetic: 'Luxury Haute Couture & Atelier',
    thumbnail: '/theme-images/fashion-2.jpg',
    heroImage: '/theme-images/fashion-2.jpg',
    storyImage: '/theme-images/fashion-5.jpg',
    bannerImage: '/theme-images/fashion-7.jpg',
    products: [
      { id: 'soft_peach_1', name: 'Silk Chiffon Atelier Evening Gown', price: 24500, discountPercent: 10, image: '/theme-images/fashion-3.jpg', tag: 'Haute Couture', category: 'Evening Wear', brand: 'Aura' },
      { id: 'soft_peach_2', name: 'French Runway Tailored Blazer', price: 18600, discountPercent: 15, image: '/theme-images/fashion-1.png', tag: 'Runway Edit', category: 'Tailoring', brand: 'Aura' },
      { id: 'soft_peach_3', name: 'Sculpted Draped Midi Dress', price: 15900, discountPercent: 0, image: '/theme-images/fashion-4.jpeg', tag: 'Atelier Pick', category: 'Dresses', brand: 'Aura' },
      { id: 'soft_peach_4', name: 'Cashmere Blend Studio Wrap', price: 9800, discountPercent: 5, image: '/theme-images/fashion-6.jpg', tag: 'Studio Essential', category: 'Apparel', brand: 'Aura' }
    ]
  },
  preset_pearl_blush: {
    brandName: 'Frosted Pearl Fine Jewelry',
    tagline: 'Bridal Diamonds & Heirloom Gold',
    aesthetic: 'Luxury Fine Jewelry & Bridal',
    thumbnail: '/theme-images/jewelry-2.jpg',
    heroImage: '/theme-images/jewelry-2.jpg',
    storyImage: '/theme-images/jewelry-4.jpeg',
    bannerImage: '/theme-images/jewelry-1.jpg',
    products: [
      { id: 'pearl_blush_1', name: 'Art Deco Diamond Station Necklace', price: 86000, discountPercent: 0, image: '/theme-images/jewelry-3.jpg', tag: 'Bridal Heirloom', category: 'Necklaces', brand: 'Frosted' },
      { id: 'pearl_blush_2', name: 'Rose Gold Floral Diamond Set', price: 64500, discountPercent: 10, image: '/theme-images/jewelry-5.jpg', tag: 'Signature Set', category: 'Sets', brand: 'Frosted' },
      { id: 'pearl_blush_3', name: 'Emerald Drop Pearl Necklace', price: 48000, discountPercent: 5, image: '/theme-images/jewelry-6.jpg', tag: 'Occasion Wear', category: 'Necklaces', brand: 'Frosted' },
      { id: 'pearl_blush_4', name: 'Hand-Set Diamond Solitaire Earrings', price: 32000, discountPercent: 0, image: '/theme-images/jewelry-1.jpg', tag: 'Atelier Crafted', category: 'Earrings', brand: 'Frosted' }
    ]
  },
  preset_sand_terracotta: {
    brandName: 'Terra & Thread Atelier',
    tagline: 'Artisan Books, Footwear & Slow Craft',
    aesthetic: 'Artisan Books & Footwear',
    thumbnail: '/theme-images/beige-1.jpg',
    heroImage: '/theme-images/beige-1.jpg',
    storyImage: '/theme-images/organic-3.jpg',
    bannerImage: '/theme-images/beige-3.jpg',
    products: [
      { id: 'sand_terracotta_1', name: 'Handbound Leather Journal', price: 2400, discountPercent: 10, image: '/theme-images/beige-3.jpg', tag: 'Studio Craft', category: 'Journals', brand: 'Terra' },
      { id: 'sand_terracotta_2', name: 'Terracotta Ceramic Planter Set', price: 1850, discountPercent: 5, image: '/theme-images/organic-4.jpg', tag: 'Artisan Home', category: 'Decor', brand: 'Terra' },
      { id: 'sand_terracotta_3', name: 'Heritage Grain Gift Box', price: 1250, discountPercent: 0, image: '/theme-images/organic-3.jpg', tag: 'Farm Fresh', category: 'Grocery', brand: 'Terra' },
      { id: 'sand_terracotta_4', name: 'Woven Cotton Throw Blanket', price: 3200, discountPercent: 8, image: '/theme-images/beige-5.png', tag: 'Slow Living', category: 'Home', brand: 'Terra' }
    ]
  },
  preset_sage_linen: {
    brandName: 'Sage & Linen Farms',
    tagline: 'Organic Millets, Grains & Farm Goods',
    aesthetic: 'Organic Millets & Farm Foods',
    thumbnail: '/theme-images/organic-1.webp',
    heroImage: '/theme-images/organic-1.webp',
    storyImage: '/theme-images/organic-2.jpg',
    bannerImage: '/theme-images/organic-3.jpg',
    products: [
      { id: 'sage_linen_1', name: 'Heritage Millet Grain Trio', price: 640, discountPercent: 10, image: '/theme-images/organic-3.jpg', tag: 'Farm Milled', category: 'Millets', brand: 'Sage' },
      { id: 'sage_linen_2', name: 'Cold-Pressed Groundnut Oil', price: 480, discountPercent: 0, image: '/theme-images/organic-4.jpg', tag: 'Single Farm', category: 'Oils', brand: 'Sage' },
      { id: 'sage_linen_3', name: 'Chemical-Free Veg Basket', price: 750, discountPercent: 5, image: '/theme-images/organic-1.webp', tag: 'Harvest Fresh', category: 'Vegetables', brand: 'Sage' },
      { id: 'sage_linen_4', name: 'Stone-Ground Millet Flour', price: 380, discountPercent: 0, image: '/theme-images/organic-2.jpg', tag: 'Traditional Chakki', category: 'Flours', brand: 'Sage' }
    ]
  },
  preset_pure_cloud: {
    brandName: 'CLOUD9 Street Division',
    tagline: 'Streetwear Drops & Sneaker Culture',
    aesthetic: 'Modern Editorial & Streetwear',
    thumbnail: '/theme-images/street-2.jpg',
    heroImage: '/theme-images/street-2.jpg',
    storyImage: '/theme-images/street-4.jpg',
    bannerImage: '/theme-images/street-3.jpg',
    products: [
      { id: 'pure_cloud_1', name: 'Limited Drop Graphic Oversized Tee', price: 1899, discountPercent: 15, image: '/theme-images/street-1.png', tag: 'Hype Drop', category: 'Tees', brand: 'CLOUD9' },
      { id: 'pure_cloud_2', name: 'Retro Court Sneakers', price: 4299, discountPercent: 10, image: '/theme-images/street-3.jpg', tag: 'Sneaker Edit', category: 'Footwear', brand: 'CLOUD9' },
      { id: 'pure_cloud_3', name: 'Monochrome Layered Hoodie', price: 2499, discountPercent: 0, image: '/theme-images/street-4.jpg', tag: 'Core Staple', category: 'Hoodies', brand: 'CLOUD9' },
      { id: 'pure_cloud_4', name: 'Utility Cargo Joggers', price: 2199, discountPercent: 5, image: '/theme-images/street-1.png', tag: 'Street Utility', category: 'Bottoms', brand: 'CLOUD9' }
    ]
  },
  preset_playful_pop: {
    brandName: 'POP! Youth Collective',
    tagline: 'Gen-Z Fashion, Colour & Sneakers',
    aesthetic: 'Youth Fashion & Streetwear',
    thumbnail: '/theme-images/street-2.jpg',
    heroImage: '/theme-images/street-2.jpg',
    storyImage: '/theme-images/fashion-5.jpg',
    bannerImage: '/theme-images/street-3.jpg',
    products: [
      { id: 'playful_pop_1', name: 'All-Pink Statement Fit', price: 2999, discountPercent: 20, image: '/theme-images/street-2.jpg', tag: 'Viral Fit', category: 'Coords', brand: 'POP!' },
      { id: 'playful_pop_2', name: 'Chunky Sole Rainbow Sneakers', price: 3999, discountPercent: 10, image: '/theme-images/street-3.jpg', tag: 'Trending', category: 'Footwear', brand: 'POP!' },
      { id: 'playful_pop_3', name: 'Bold Graphic Street Tee', price: 1299, discountPercent: 0, image: '/theme-images/street-1.png', tag: 'Everyday', category: 'Tees', brand: 'POP!' },
      { id: 'playful_pop_4', name: 'Pop Colour Crossbody Bag', price: 1699, discountPercent: 15, image: '/theme-images/bags-3.jpg', tag: 'Accents', category: 'Bags', brand: 'POP!' }
    ]
  },
  preset_editorial_boutique: {
    brandName: 'MAISON ELEVE',
    tagline: 'Premium Fashion Lookbook',
    aesthetic: 'Premium Fashion Lookbook',
    thumbnail: '/theme-images/beige-1.jpg',
    heroImage: '/theme-images/beige-1.jpg',
    storyImage: '/theme-images/beige-2.jpg',
    bannerImage: '/theme-images/beige-5.png',
    products: [
      { id: 'editorial_boutique_1', name: 'Cream Trench & Wide-Leg Coord', price: 14800, discountPercent: 10, image: '/theme-images/beige-1.jpg', tag: 'Lookbook 01', category: 'Coords', brand: 'MAISON' },
      { id: 'editorial_boutique_2', name: 'Tailored Beige Longline Coat', price: 16500, discountPercent: 0, image: '/theme-images/beige-2.jpg', tag: 'Lookbook 02', category: 'Outerwear', brand: 'MAISON' },
      { id: 'editorial_boutique_3', name: 'Fine Knit Sweater Vest', price: 5400, discountPercent: 5, image: '/theme-images/beige-4.jpg', tag: 'Lookbook 03', category: 'Knitwear', brand: 'MAISON' },
      { id: 'editorial_boutique_4', name: 'Neutral-Tone Capsule Hanger Set', price: 7200, discountPercent: 0, image: '/theme-images/beige-3.jpg', tag: 'Capsule Edit', category: 'Sets', brand: 'MAISON' }
    ]
  },
  preset_quiet_luxe: {
    brandName: 'ORDINARY Essentials',
    tagline: 'Considered Essentials, Made to Last',
    aesthetic: 'Considered Essentials & Boutique',
    thumbnail: '/theme-images/beige-2.jpg',
    heroImage: '/theme-images/beige-2.jpg',
    storyImage: '/theme-images/beige-4.jpg',
    bannerImage: '/theme-images/beige-1.jpg',
    products: [
      { id: 'quiet_luxe_1', name: 'Merino Ribbed Knit Set', price: 8900, discountPercent: 0, image: '/theme-images/beige-4.jpg', tag: 'Essential', category: 'Knitwear', brand: 'ORDINARY' },
      { id: 'quiet_luxe_2', name: 'Ivory Funnel Knit Sweater', price: 6800, discountPercent: 5, image: '/theme-images/beige-3.jpg', tag: 'Core Piece', category: 'Sweaters', brand: 'ORDINARY' },
      { id: 'quiet_luxe_3', name: 'Sand Tailored Trousers', price: 5900, discountPercent: 0, image: '/theme-images/beige-2.jpg', tag: 'Everyday Luxe', category: 'Bottoms', brand: 'ORDINARY' },
      { id: 'quiet_luxe_4', name: 'Oatmeal Oversized Shirt', price: 4900, discountPercent: 10, image: '/theme-images/beige-5.png', tag: 'Quiet Edit', category: 'Shirts', brand: 'ORDINARY' }
    ]
  },
  preset_editorial_zine: {
    brandName: 'THE ZINE Collective',
    tagline: 'Editorial Fashion Magazine Store',
    aesthetic: 'Editorial Magazine & Zine',
    thumbnail: '/theme-images/fashion-1.png',
    heroImage: '/theme-images/fashion-1.png',
    storyImage: '/theme-images/fashion-6.jpg',
    bannerImage: '/theme-images/fashion-3.jpg',
    products: [
      { id: 'editorial_zine_1', name: 'Cover Story Silk Slip Dress', price: 13400, discountPercent: 10, image: '/theme-images/fashion-3.jpg', tag: 'Issue 12', category: 'Dresses', brand: 'THE' },
      { id: 'editorial_zine_2', name: 'Studio Portrait Tailored Suit', price: 17800, discountPercent: 0, image: '/theme-images/fashion-2.jpg', tag: 'Editorial', category: 'Tailoring', brand: 'THE' },
      { id: 'editorial_zine_3', name: 'Backstage Knit Coord', price: 8600, discountPercent: 15, image: '/theme-images/fashion-6.jpg', tag: 'Featured', category: 'Coords', brand: 'THE' },
      { id: 'editorial_zine_4', name: 'Runway Accessory Capsule', price: 6900, discountPercent: 5, image: '/theme-images/fashion-4.jpeg', tag: 'Styled', category: 'Accessories', brand: 'THE' }
    ]
  },
  preset_kinetic_pulse: {
    brandName: 'PULSE Athletic Lab',
    tagline: 'Performance Tech & Activewear',
    aesthetic: 'Performance Athletic & Techwear',
    thumbnail: '/theme-images/tech-5.jpg',
    heroImage: '/theme-images/tech-5.jpg',
    storyImage: '/theme-images/tech-2.jpg',
    bannerImage: '/theme-images/tech-1.png',
    products: [
      { id: 'kinetic_pulse_1', name: 'Studio ANC Wireless Headphones', price: 7999, discountPercent: 15, image: '/theme-images/tech-5.jpg', tag: 'Best Seller', category: 'Audio', brand: 'PULSE' },
      { id: 'kinetic_pulse_2', name: 'True Wireless Sport Earbuds', price: 4499, discountPercent: 10, image: '/theme-images/tech-2.jpg', tag: 'New Drop', category: 'Earbuds', brand: 'PULSE' },
      { id: 'kinetic_pulse_3', name: 'Pro Multisport GPS Watch', price: 24999, discountPercent: 0, image: '/theme-images/tech-3.png', tag: 'Pro Gear', category: 'Wearables', brand: 'PULSE' },
      { id: 'kinetic_pulse_4', name: 'Rapid Charge Power Bank', price: 2999, discountPercent: 20, image: '/theme-images/tech-4.jpg', tag: 'Essential', category: 'Power', brand: 'PULSE' }
    ]
  },
  preset_parfum_botanical: {
    brandName: 'FLEUR Botanique',
    tagline: 'Perfume, Skincare & Beauty Rituals',
    aesthetic: 'Beauty, Perfume & Skincare',
    thumbnail: '/theme-images/beauty-1.jpeg',
    heroImage: '/theme-images/beauty-1.jpeg',
    storyImage: '/theme-images/beauty-2.jpg',
    bannerImage: '/theme-images/beauty-4.jpg',
    products: [
      { id: 'parfum_botanical_1', name: 'Fresh Calming Serum Duo', price: 3450, discountPercent: 10, image: '/theme-images/beauty-1.jpeg', tag: 'Ritual Set', category: 'Skincare', brand: 'FLEUR' },
      { id: 'parfum_botanical_2', name: 'Rose Quartz Hydrating Cream', price: 2800, discountPercent: 0, image: '/theme-images/beauty-2.jpg', tag: 'Best Seller', category: 'Skincare', brand: 'FLEUR' },
      { id: 'parfum_botanical_3', name: 'Botanical Gift Discovery Box', price: 4950, discountPercent: 15, image: '/theme-images/beauty-3.jpeg', tag: 'Gift Ready', category: 'Sets', brand: 'FLEUR' },
      { id: 'parfum_botanical_4', name: 'Sun-Kissed Mineral SPF', price: 1950, discountPercent: 5, image: '/theme-images/beauty-4.jpg', tag: 'Daily', category: 'Sun Care', brand: 'FLEUR' }
    ]
  },
  preset_markly_luxe: {
    brandName: 'MARKLY',
    tagline: 'Editorial Leather Bags & Minimal Luxury',
    aesthetic: 'Editorial Luxury Minimal',
    thumbnail: '/theme-images/bags-3.jpg',
    heroImage: '/theme-images/bags-3.jpg',
    storyImage: '/theme-images/bags-6.jpg',
    bannerImage: '/theme-images/bags-1.png',
    products: [
      { id: 'markly_luxe_1', name: 'Structured Leather Shoulder Bag', price: 12900, discountPercent: 10, image: '/theme-images/bags-3.jpg', tag: 'Icon', category: 'Handbags', brand: 'MARKLY' },
      { id: 'markly_luxe_2', name: 'Tri-Leather Mini Backpack', price: 9800, discountPercent: 0, image: '/theme-images/bags-1.png', tag: 'New Season', category: 'Backpacks', brand: 'MARKLY' },
      { id: 'markly_luxe_3', name: 'Burgundy Gold-Hardware Bag', price: 11500, discountPercent: 5, image: '/theme-images/bags-4.png', tag: 'Editorial', category: 'Handbags', brand: 'MARKLY' },
      { id: 'markly_luxe_4', name: 'Cream Crescent Crossbody', price: 8600, discountPercent: 15, image: '/theme-images/bags-5.jpg', tag: 'Everyday', category: 'Crossbody', brand: 'MARKLY' }
    ]
  },
  preset_lavender_haze: {
    brandName: 'LAVENDER HAZE Skin',
    tagline: 'Dreamy Skincare & Aromatherapy',
    aesthetic: 'Skincare & Aromatherapy',
    thumbnail: '/theme-images/beauty-3.jpeg',
    heroImage: '/theme-images/beauty-3.jpeg',
    storyImage: '/theme-images/beauty-2.jpg',
    bannerImage: '/theme-images/beauty-1.jpeg',
    products: [
      { id: 'lavender_haze_1', name: 'Hydration Repair Gift Set', price: 4200, discountPercent: 10, image: '/theme-images/beauty-3.jpeg', tag: 'Gift Edit', category: 'Sets', brand: 'LAVENDER' },
      { id: 'lavender_haze_2', name: 'Pastel Botanical Face Ritual', price: 2950, discountPercent: 0, image: '/theme-images/beauty-2.jpg', tag: 'Best Seller', category: 'Skincare', brand: 'LAVENDER' },
      { id: 'lavender_haze_3', name: 'Silk Pillow & Cream Duo', price: 3600, discountPercent: 15, image: '/theme-images/beauty-1.jpeg', tag: 'Sleep Ritual', category: 'Wellness', brand: 'LAVENDER' },
      { id: 'lavender_haze_4', name: 'Glow Serum Starter Kit', price: 2400, discountPercent: 5, image: '/theme-images/beauty-4.jpg', tag: 'Starter', category: 'Serums', brand: 'LAVENDER' }
    ]
  },
  preset_rosegold_atelier: {
    brandName: 'ROSE GOLD Saree Atelier',
    tagline: 'Designer Sarees & Indian Couture',
    aesthetic: 'Designer Sarees & Indian Couture',
    thumbnail: '/theme-images/saree-5.png',
    heroImage: '/theme-images/saree-5.png',
    storyImage: '/theme-images/saree-2.jpg',
    bannerImage: '/theme-images/saree-1.jpg',
    products: [
      { id: 'rosegold_atelier_1', name: 'Handloom Patola Silk Saree', price: 32500, discountPercent: 10, image: '/theme-images/saree-5.png', tag: 'Heirloom', category: 'Silk Sarees', brand: 'ROSE' },
      { id: 'rosegold_atelier_2', name: 'Cream & Emerald Silk Drape', price: 24800, discountPercent: 0, image: '/theme-images/saree-2.jpg', tag: 'Bridal Edit', category: 'Silk Sarees', brand: 'ROSE' },
      { id: 'rosegold_atelier_3', name: 'Turquoise Bridal Silk Set', price: 28900, discountPercent: 5, image: '/theme-images/saree-3.png', tag: 'Wedding Trousseau', category: 'Bridal', brand: 'ROSE' },
      { id: 'rosegold_atelier_4', name: 'Draped Saree Gown Coral', price: 19900, discountPercent: 15, image: '/theme-images/saree-4.jpg', tag: 'Modern Drape', category: 'Gowns', brand: 'ROSE' }
    ]
  },
  preset_nordic_frost: {
    brandName: 'NORDIK Frost Tech',
    tagline: 'Gadgets, Audio & Precision Gear',
    aesthetic: 'Modern Tech & Gadgets',
    thumbnail: '/theme-images/tech-5.jpg',
    heroImage: '/theme-images/tech-5.jpg',
    storyImage: '/theme-images/tech-3.png',
    bannerImage: '/theme-images/tech-2.jpg',
    products: [
      { id: 'nordic_frost_1', name: 'Flagship ANC Studio Headphones', price: 12999, discountPercent: 10, image: '/theme-images/tech-5.jpg', tag: 'Top Pick', category: 'Audio', brand: 'NORDIK' },
      { id: 'nordic_frost_2', name: 'Sport True Wireless Buds', price: 5999, discountPercent: 15, image: '/theme-images/tech-2.jpg', tag: 'Trending', category: 'Earbuds', brand: 'NORDIK' },
      { id: 'nordic_frost_3', name: 'Multisport Adventure Watch', price: 21999, discountPercent: 0, image: '/theme-images/tech-3.png', tag: 'Pro Series', category: 'Wearables', brand: 'NORDIK' },
      { id: 'nordic_frost_4', name: 'Everyday Carry Gadget Kit', price: 4999, discountPercent: 5, image: '/theme-images/tech-4.jpg', tag: 'EDC', category: 'Accessories', brand: 'NORDIK' }
    ]
  },
  preset_emerald_botanical: {
    brandName: 'EMERALD Leaf Wellness',
    tagline: 'Herbal Teas, Wellness & Botanicals',
    aesthetic: 'Herbal Wellness & Botanicals',
    thumbnail: '/theme-images/tea-1.jpg',
    heroImage: '/theme-images/tea-1.jpg',
    storyImage: '/theme-images/tea-5.png',
    bannerImage: '/theme-images/tea-2.jpg',
    products: [
      { id: 'emerald_botanical_1', name: 'Whole-Leaf Chamomile Infusion', price: 740, discountPercent: 10, image: '/theme-images/tea-5.png', tag: 'Calming', category: 'Teas', brand: 'EMERALD' },
      { id: 'emerald_botanical_2', name: 'Detox Herbal Tea Caddy', price: 980, discountPercent: 0, image: '/theme-images/tea-2.jpg', tag: 'Best Seller', category: 'Teas', brand: 'EMERALD' },
      { id: 'emerald_botanical_3', name: 'Botanical Spa Ritual Set', price: 1650, discountPercent: 15, image: '/theme-images/tea-1.jpg', tag: 'Spa Edit', category: 'Wellness', brand: 'EMERALD' },
      { id: 'emerald_botanical_4', name: 'Artisan Single-Estate Green Tea', price: 1240, discountPercent: 5, image: '/theme-images/tea-6.png', tag: 'Estate Pick', category: 'Teas', brand: 'EMERALD' }
    ]
  },
  preset_sunset_amber: {
    brandName: 'AMBER Utsav',
    tagline: 'Festive Crafts, Sweets & Decor',
    aesthetic: 'Festive Crafts & Decor',
    thumbnail: '/theme-images/craft-1.webp',
    heroImage: '/theme-images/craft-1.webp',
    storyImage: '/theme-images/saree-3.png',
    bannerImage: '/theme-images/craft-2.webp',
    products: [
      { id: 'sunset_amber_1', name: 'Marigold Festive Decor Set', price: 1450, discountPercent: 10, image: '/theme-images/craft-1.webp', tag: 'Utsav Edit', category: 'Decor', brand: 'AMBER' },
      { id: 'sunset_amber_2', name: 'Hand-Painted Ceramic Serving Set', price: 2650, discountPercent: 0, image: '/theme-images/craft-2.webp', tag: 'Artisan', category: 'Tableware', brand: 'AMBER' },
      { id: 'sunset_amber_3', name: 'Festive Silk Accent Drape', price: 8900, discountPercent: 15, image: '/theme-images/saree-3.png', tag: 'Occasion', category: 'Apparel', brand: 'AMBER' },
      { id: 'sunset_amber_4', name: 'Traditional Brass Diya Trio', price: 890, discountPercent: 5, image: '/theme-images/craft-1.webp', tag: 'Festive', category: 'Decor', brand: 'AMBER' }
    ]
  },
  preset_charcoal_champagne: {
    brandName: 'CHARCOAL & Champagne',
    tagline: 'Dark Luxury Jewelry & Accessories',
    aesthetic: 'Dark Luxury & Accessories',
    thumbnail: '/theme-images/watch-3.jpg',
    heroImage: '/theme-images/watch-3.jpg',
    storyImage: '/theme-images/jewelry-3.jpg',
    bannerImage: '/theme-images/watch-4.jpg',
    products: [
      { id: 'charcoal_champagne_1', name: 'Black Dial Steel Chronograph', price: 84999, discountPercent: 10, image: '/theme-images/watch-2.jpg', tag: 'Icon Series', category: 'Watches', brand: 'CHARCOAL' },
      { id: 'charcoal_champagne_2', name: 'Cosmic Dial Luxury Quartet', price: 189999, discountPercent: 0, image: '/theme-images/watch-3.jpg', tag: 'Vault Edit', category: 'Watches', brand: 'CHARCOAL' },
      { id: 'charcoal_champagne_3', name: 'Gold Fluted Diamond Bezel', price: 124999, discountPercent: 5, image: '/theme-images/watch-4.jpg', tag: 'Statement', category: 'Watches', brand: 'CHARCOAL' },
      { id: 'charcoal_champagne_4', name: 'Art Deco Diamond Necklace', price: 96000, discountPercent: 0, image: '/theme-images/jewelry-3.jpg', tag: 'Fine Jewelry', category: 'Necklaces', brand: 'CHARCOAL' }
    ]
  },
  preset_midnight_sapphire: {
    brandName: 'SAPPHIRE Horology House',
    tagline: 'Gems, Watches & Prestige Timepieces',
    aesthetic: 'Gems, Watches & Horology',
    thumbnail: '/theme-images/watch-5.jpg',
    heroImage: '/theme-images/watch-5.jpg',
    storyImage: '/theme-images/watch-2.jpg',
    bannerImage: '/theme-images/watch-3.jpg',
    products: [
      { id: 'midnight_sapphire_1', name: 'Certified Chronometer Datejust', price: 142000, discountPercent: 0, image: '/theme-images/watch-2.jpg', tag: 'Prestige', category: 'Watches', brand: 'SAPPHIRE' },
      { id: 'midnight_sapphire_2', name: 'Sapphire Dial Automatic', price: 98999, discountPercent: 8, image: '/theme-images/watch-5.jpg', tag: 'House Pick', category: 'Watches', brand: 'SAPPHIRE' },
      { id: 'midnight_sapphire_3', name: 'Collector Quad Display Set', price: 215000, discountPercent: 0, image: '/theme-images/watch-3.jpg', tag: 'Collector', category: 'Sets', brand: 'SAPPHIRE' },
      { id: 'midnight_sapphire_4', name: 'Champagne Dial Classic', price: 87999, discountPercent: 10, image: '/theme-images/watch-1.jpg', tag: 'Classic', category: 'Watches', brand: 'SAPPHIRE' }
    ]
  },
  preset_noir_obsidian: {
    brandName: 'NOIR Obsidian Gallery',
    tagline: 'Dark Glass Luxury & Gold Accents',
    aesthetic: 'Dark Glass Luxury',
    thumbnail: '/theme-images/watch-3.jpg',
    heroImage: '/theme-images/watch-3.jpg',
    storyImage: '/theme-images/jewelry-5.jpg',
    bannerImage: '/theme-images/watch-4.jpg',
    products: [
      { id: 'noir_obsidian_1', name: 'Obsidian Dial Automatic', price: 118000, discountPercent: 10, image: '/theme-images/watch-3.jpg', tag: 'Gallery', category: 'Watches', brand: 'NOIR' },
      { id: 'noir_obsidian_2', name: 'Black Sapphire Pendant Set', price: 67500, discountPercent: 0, image: '/theme-images/jewelry-5.jpg', tag: 'Fine Edit', category: 'Jewelry', brand: 'NOIR' },
      { id: 'noir_obsidian_3', name: 'Midnight Gold Cuff Trio', price: 54900, discountPercent: 5, image: '/theme-images/jewelry-6.jpg', tag: 'Statement', category: 'Jewelry', brand: 'NOIR' },
      { id: 'noir_obsidian_4', name: 'Dark Dial Steel Bracelet', price: 76999, discountPercent: 8, image: '/theme-images/watch-4.jpg', tag: 'Everyday Luxe', category: 'Watches', brand: 'NOIR' }
    ]
  },
  preset_coral_silk: {
    brandName: 'CORAL SILK Boutique',
    tagline: 'Gifts, Toys & Soft Pastel Goods',
    aesthetic: 'Boutique Gifts & Toys',
    thumbnail: '/theme-images/bags-4.png',
    heroImage: '/theme-images/bags-4.png',
    storyImage: '/theme-images/beauty-2.jpg',
    bannerImage: '/theme-images/bags-2.jpg',
    products: [
      { id: 'coral_silk_1', name: 'Sunset Orange Leather Tote', price: 6800, discountPercent: 10, image: '/theme-images/bags-4.png', tag: 'Gift Pick', category: 'Handbags', brand: 'CORAL' },
      { id: 'coral_silk_2', name: 'Gold-Logo City Satchel', price: 5400, discountPercent: 0, image: '/theme-images/bags-2.jpg', tag: 'Best Seller', category: 'Handbags', brand: 'CORAL' },
      { id: 'coral_silk_3', name: 'Pastel Rose Beauty Ritual', price: 2950, discountPercent: 15, image: '/theme-images/beauty-2.jpg', tag: 'Gift Set', category: 'Beauty', brand: 'CORAL' },
      { id: 'coral_silk_4', name: 'Everyday Cream Crossbody', price: 4700, discountPercent: 5, image: '/theme-images/bags-5.jpg', tag: 'Everyday', category: 'Bags', brand: 'CORAL' }
    ]
  },
};

const stripEmoji = (name) => name.replace(/^[^\w(]+/, '').trim();

const presetToMarketplaceEntry = (preset, index) => {
  const meta = THEME_META[preset.id] || {};
  return {
    id: `theme_${preset.id.replace('preset_', '')}`,
    presetId: preset.id,
    name: stripEmoji(preset.name),
    brandName: meta.brandName || stripEmoji(preset.name),
    tagline: meta.tagline || preset.desc,
    aesthetic: meta.aesthetic || 'Storefront Preset',
    vibe: preset.desc,
    version: 'v3.2.0',
    isDefaultActive: index === 0,
    thumbnail:
      meta.thumbnail ||
      'https://i.pinimg.com/736x/2b/43/d8/2b43d8396c21e64bf873c52e67df146d.jpg',
    heroImage: meta.heroImage || meta.thumbnail,
    storyImage: meta.storyImage || meta.thumbnail,
    bannerImage: meta.bannerImage || meta.thumbnail,
    description: preset.desc,
    featureTags: meta.featureTags || ['🎨 Preset Styling', '📱 Mobile Optimized', '⚡ Fast Checkout'],
    products: meta.products || []
  };
};

// Merchant console theme gallery (Channels → Online Store → Themes)
export const THEME_MARKETPLACE = HARMONIOUS_THEME_PRESETS.map(presetToMarketplaceEntry);

// Super Admin master themes catalog (shape used by /super-admin/themes)
export const MASTER_THEME_CATALOG = HARMONIOUS_THEME_PRESETS.map((p, index) => {
  const entry = presetToMarketplaceEntry(p, index);
  return {
    id: p.id,
    presetId: p.id,
    name: entry.name,
    brandName: entry.brandName,
    slug: p.id.replace('preset_', '').replace(/_/g, '-'),
    vertical: entry.aesthetic,
    category: entry.aesthetic,
    version: entry.version,
    tierAccess: 'free',
    priceINR: 0,
    isPublished: true,
    thumbnail: entry.thumbnail,
    heroImage: entry.heroImage,
    storyImage: entry.storyImage,
    bannerImage: entry.bannerImage,
    tagline: entry.tagline,
    products: entry.products,
    tokens: {
      headingFont: p.headingFont,
      bodyFont: p.bodyFont,
      primaryAccent: p.accentColor,
      backgroundColor: p.backgroundColor,
      surfaceColor: p.surfaceColor,
      headingColor: p.headingColor,
      buttonRadius: p.buttonRadius
    }
  };
});
