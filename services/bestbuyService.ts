
import { Product, Supplier } from '../types';

const MOCK_BESTBUY_PRODUCTS: Product[] = [
  // Laptops
  { id: 'prod_macbook_pro', name: 'MacBook Pro 14"', image: 'https://picsum.photos/seed/macbookpro/200/200', suppliers: [{ name: 'e-Retailer', price: 1999 }, { name: 'DirectSource', price: 1949 }, { name: 'TechGiant', price: 2010 }] },
  { id: 'prod_macbook_air', name: 'MacBook Air 13"', image: 'https://picsum.photos/seed/macbookair/200/200', suppliers: [{ name: 'e-Retailer', price: 999 }, { name: 'DirectSource', price: 979 }] },
  { id: 'prod_surface', name: 'Microsoft Surface Pro 9', image: 'https://picsum.photos/seed/surface/200/200', suppliers: [{ name: 'e-Retailer', price: 1299 }, { name: 'PCWorld', price: 1259 }, { name: 'DirectSource', price: 1289 }] },
  { id: 'prod_dell_xps', name: 'Dell XPS 15 Laptop', image: 'https://picsum.photos/seed/dellxps/200/200', suppliers: [{ name: 'DirectSource', price: 1599 }, { name: 'PCWorld', price: 1549 }] },
  
  // Phones & Tablets
  { id: 'prod_ipad_air', name: 'iPad Air', image: 'https://picsum.photos/seed/ipadair/200/200', suppliers: [{ name: 'TechGiant', price: 799 }, { name: 'e-Retailer', price: 789 }] },
  { id: 'prod_galaxy_tab', name: 'Samsung Galaxy Tab S9', image: 'https://picsum.photos/seed/galaxytab/200/200', suppliers: [{ name: 'e-Retailer', price: 899 }, { name: 'DirectSource', price: 879 }] },
  { id: 'prod_iphone_15', name: 'iPhone 15 Pro', image: 'https://picsum.photos/seed/iphone15/200/200', suppliers: [{ name: 'e-Retailer', price: 999 }, { name: 'TechGiant', price: 1019 }] },
  { id: 'prod_pixel_8', name: 'Google Pixel 8 Pro', image: 'https://picsum.photos/seed/pixel8/200/200', suppliers: [{ name: 'DirectSource', price: 899 }, { name: 'e-Retailer', price: 889 }] },

  // Wearables & Audio
  { id: 'prod_apple_watch', name: 'Apple Watch Ultra 2', image: 'https://picsum.photos/seed/applewatch/200/200', suppliers: [{ name: 'TechGiant', price: 799 }] },
  { id: 'prod_galaxy_watch', name: 'Samsung Galaxy Watch 6', image: 'https://picsum.photos/seed/galaxywatch/200/200', suppliers: [{ name: 'e-Retailer', price: 399 }, { name: 'DirectSource', price: 379 }] },
  { id: 'prod_sony_headphones', name: 'Sony WH-1000XM5 Headphones', image: 'https://picsum.photos/seed/sonywh/200/200', suppliers: [{ name: 'e-Retailer', price: 349 }, { name: 'AudioPhile', price: 329 }] },
  { id: 'prod_bose_headphones', name: 'Bose QuietComfort Ultra', image: 'https://picsum.photos/seed/boseqc/200/200', suppliers: [{ name: 'AudioPhile', price: 429 }, { name: 'e-Retailer', price: 419 }] },
  { id: 'prod_airpods_pro', name: 'Apple AirPods Pro (2nd Gen)', image: 'https://picsum.photos/seed/airpodspro/200/200', suppliers: [{ name: 'TechGiant', price: 249 }, { name: 'e-Retailer', price: 239 }] },

  // Home Entertainment
  { id: 'prod_tv_lg_c3', name: 'LG 65" Class C3 Series OLED 4K TV', image: 'https://picsum.photos/seed/lgtvc3/200/200', suppliers: [{ name: 'e-Retailer', price: 1599 }, { name: 'DirectSource', price: 1579 }] },
  { id: 'prod_tv_samsung_qled', name: 'Samsung 75" Class QN90C Neo QLED 4K TV', image: 'https://picsum.photos/seed/samsungtv/200/200', suppliers: [{ name: 'DirectSource', price: 2199 }] },
  { id: 'prod_soundbar_sonos', name: 'Sonos Arc Soundbar', image: 'https://picsum.photos/seed/sonosarc/200/200', suppliers: [{ name: 'AudioPhile', price: 899 }, { name: 'e-Retailer', price: 889 }] },

  // Gaming
  { id: 'prod_ps5', name: 'PlayStation 5 Console', image: 'https://picsum.photos/seed/ps5/200/200', suppliers: [{ name: 'GameStop', price: 499 }, { name: 'e-Retailer', price: 509 }] },
  { id: 'prod_xbox', name: 'Xbox Series X Console', image: 'https://picsum.photos/seed/xbox/200/200', suppliers: [{ name: 'GameStop', price: 499 }, { name: 'DirectSource', price: 489 }] },
  { id: 'prod_switch', name: 'Nintendo Switch OLED', image: 'https://picsum.photos/seed/switch/200/200', suppliers: [{ name: 'GameStop', price: 349 }] },
];

export const searchProducts = (query: string): Product[] => {
    const lowerCaseQuery = query.toLowerCase();
    if (!lowerCaseQuery) return [];
    
    return MOCK_BESTBUY_PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery)
    );
};