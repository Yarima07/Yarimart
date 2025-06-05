import 'dotenv/config'; // Load environment variables from .env file
import { supabase } from '../src/lib/supabase';

const sampleProducts = [
  // Power Tools
  {
    name: 'Professional Impact Drill',
    price: 24999,
    discount: 10,
    description: 'Heavy-duty impact drill with variable speed control and hammer function. Perfect for professional use.',
    category: 'Power Tools',
    subcategory: 'Drills',
    tags: ['drill', 'impact', 'professional'],
    images: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
      'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg'
    ],
    colors: ['Black', 'Blue', 'Red'],
    sizes: ['Standard', 'Compact'],
    specifications: {
      power: '1200W',
      voltage: '230V',
      weight: '2.9kg',
      dimensions: '362 x 102 x 114mm',
      warranty: '3 years',
      manufacturer: 'YariTools Pro',
      countryOfOrigin: 'India'
    },
    rating: 4.8,
    reviews: 245,
    stock: 50
  },
  {
    name: 'Cordless Angle Grinder',
    price: 15999,
    discount: 15,
    description: 'Powerful cordless angle grinder with brushless motor and variable speed control.',
    category: 'Power Tools',
    subcategory: 'Grinders',
    tags: ['grinder', 'cordless', 'professional'],
    images: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
      'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg'
    ],
    colors: ['Black', 'Green'],
    sizes: ['4.5"', '5"'],
    specifications: {
      power: '18V',
      voltage: 'Battery powered',
      weight: '2.1kg',
      dimensions: '311 x 104 x 128mm',
      warranty: '2 years',
      manufacturer: 'YariTools Pro',
      countryOfOrigin: 'India'
    },
    rating: 4.6,
    reviews: 182,
    stock: 35
  },
  
  // Safety Equipment
  {
    name: 'Premium Safety Helmet',
    price: 2499,
    discount: 0,
    description: 'High-quality safety helmet with adjustable fitting and ventilation.',
    category: 'Safety Equipment',
    subcategory: 'Head Protection',
    tags: ['safety', 'helmet', 'protection'],
    images: [
      'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg',
      'https://images.pexels.com/photos/8005398/pexels-photo-8005398.jpeg'
    ],
    colors: ['White', 'Yellow', 'Red', 'Blue'],
    sizes: ['M', 'L', 'XL'],
    specifications: {
      material: 'High-impact ABS',
      weight: '450g',
      warranty: '1 year',
      manufacturer: 'YariSafety',
      countryOfOrigin: 'India'
    },
    rating: 4.7,
    reviews: 156,
    stock: 200
  },
  {
    name: 'Cut Resistant Gloves',
    price: 999,
    discount: 5,
    description: 'High-performance cut-resistant gloves for industrial use.',
    category: 'Safety Equipment',
    subcategory: 'Hand Protection',
    tags: ['safety', 'gloves', 'protection'],
    images: [
      'https://images.pexels.com/photos/3846076/pexels-photo-3846076.jpeg',
      'https://images.pexels.com/photos/3846077/pexels-photo-3846077.jpeg'
    ],
    colors: ['Gray', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: {
      material: 'HPPE + Steel Fiber',
      weight: '120g',
      warranty: '6 months',
      manufacturer: 'YariSafety',
      countryOfOrigin: 'India'
    },
    rating: 4.5,
    reviews: 245,
    stock: 300
  },
  
  // Industrial Equipment
  {
    name: 'Industrial Air Compressor',
    price: 89999,
    discount: 0,
    description: 'High-capacity industrial air compressor with dual-stage compression.',
    category: 'Industrial Equipment',
    subcategory: 'Compressors',
    tags: ['compressor', 'industrial', 'heavy-duty'],
    images: [
      'https://images.pexels.com/photos/210881/pexels-photo-210881.jpeg',
      'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg'
    ],
    sizes: ['50L', '100L'],
    specifications: {
      power: '5500W',
      voltage: '400V',
      weight: '125kg',
      warranty: '3 years',
      manufacturer: 'YariIndustrial',
      countryOfOrigin: 'India'
    },
    rating: 4.9,
    reviews: 78,
    stock: 15
  },
  
  // New Arrivals
  {
    name: 'Smart Measuring Laser Tool',
    price: 14999,
    discount: 0,
    description: 'Digital laser measuring tool with Bluetooth connectivity and smartphone app integration for precise measurements.',
    category: 'Power Tools',
    subcategory: 'Measuring Tools',
    tags: ['laser', 'measuring', 'smart', 'digital'],
    images: [
      'https://images.pexels.com/photos/5412270/pexels-photo-5412270.jpeg',
      'https://images.pexels.com/photos/5412271/pexels-photo-5412271.jpeg'
    ],
    colors: ['Black', 'Orange'],
    sizes: ['Professional', 'Compact'],
    specifications: {
      power: 'Rechargeable Li-ion Battery',
      range: '0.05-70m',
      accuracy: '±1.5mm',
      weight: '150g',
      dimensions: '120 x 50 x 30mm',
      warranty: '2 years',
      manufacturer: 'YariTools Pro',
      countryOfOrigin: 'India'
    },
    rating: 4.9,
    reviews: 47,
    stock: 65
  },
  {
    name: 'Multi-Function Power Station',
    price: 32999,
    discount: 5,
    description: 'Portable power station with multiple outputs (AC, DC, USB) for powering tools and charging batteries on job sites without electricity.',
    category: 'Power Tools',
    subcategory: 'Power Supply',
    tags: ['power', 'battery', 'charger', 'portable'],
    images: [
      'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg',
      'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg'
    ],
    colors: ['Black', 'Yellow'],
    sizes: ['1000W', '1500W', '2000W'],
    specifications: {
      capacity: '1200Wh',
      outputs: 'AC/DC/USB/USB-C',
      weight: '15kg',
      dimensions: '380 x 240 x 260mm',
      warranty: '3 years',
      manufacturer: 'YariTools Pro',
      countryOfOrigin: 'India'
    },
    rating: 4.8,
    reviews: 29,
    stock: 25
  },
  
  // Spare Parts
  {
    name: 'Drill Chuck Assembly',
    price: 1999,
    discount: 0,
    description: 'Replacement drill chuck assembly compatible with most professional drill models.',
    category: 'Spare Parts',
    subcategory: 'Drill Parts',
    tags: ['spare parts', 'drill', 'chuck'],
    images: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
      'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg'
    ],
    specifications: {
      material: 'Hardened Steel',
      weight: '350g',
      warranty: '6 months',
      manufacturer: 'YariParts',
      countryOfOrigin: 'India'
    },
    rating: 4.6,
    reviews: 89,
    stock: 150
  }
];

const addProducts = async () => {
  try {
    console.log('Starting to add products to Supabase...');
    
    // Insert products in batches to avoid hitting rate limits
    const batchSize = 4;
    const batches = [];
    
    for (let i = 0; i < sampleProducts.length; i += batchSize) {
      batches.push(sampleProducts.slice(i, i + batchSize));
    }
    
    console.log(`Split into ${batches.length} batches for processing.`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length}...`);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error in batch ${i + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Successfully processed batch ${i + 1}.`);
        successCount += batch.length;
      }
      
      // Add a small delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('Process completed.');
    console.log(`Total products: ${sampleProducts.length}`);
    console.log(`Successfully added: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('Some products failed to be added. Check the logs above for details.');
    } else {
      console.log('All products were added successfully!');
    }
    
  } catch (error) {
    console.error('Process failed with error:', error);
  } finally {
    // Close the Supabase client connection
    await supabase.auth.signOut();
  }
};

addProducts().catch(console.error);