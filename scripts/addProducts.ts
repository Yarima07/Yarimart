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
  {
    name: 'Safety Goggles',
    price: 1299,
    discount: 0,
    description: 'Crystal clear safety goggles with anti-fog coating for industrial work.',
    category: 'Safety Equipment',
    subcategory: 'Eye Protection',
    tags: ['safety', 'goggles', 'eye protection'],
    images: [
      'https://images.pexels.com/photos/8005399/pexels-photo-8005399.jpeg',
      'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg'
    ],
    colors: ['Clear', 'Tinted'],
    specifications: {
      material: 'Polycarbonate lens',
      weight: '85g',
      warranty: '1 year',
      manufacturer: 'YariSafety',
      countryOfOrigin: 'India'
    },
    rating: 4.6,
    reviews: 89,
    stock: 150
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
  {
    name: 'Industrial Welding Machine',
    price: 45999,
    discount: 8,
    description: 'Professional MIG/TIG welding machine for heavy-duty industrial applications.',
    category: 'Industrial Equipment',
    subcategory: 'Welding',
    tags: ['welding', 'industrial', 'MIG', 'TIG'],
    images: [
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      'https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg'
    ],
    specifications: {
      power: '3500W',
      voltage: '220V/380V',
      weight: '28kg',
      warranty: '2 years',
      manufacturer: 'YariIndustrial',
      countryOfOrigin: 'India'
    },
    rating: 4.7,
    reviews: 134,
    stock: 25
  },
  {
    name: 'Hydraulic Lifting Jack',
    price: 12999,
    discount: 12,
    description: 'Heavy-duty hydraulic lifting jack for industrial and automotive use.',
    category: 'Industrial Equipment',
    subcategory: 'Lifting Equipment',
    tags: ['hydraulic', 'jack', 'lifting', 'automotive'],
    images: [
      'https://images.pexels.com/photos/4489061/pexels-photo-4489061.jpeg',
      'https://images.pexels.com/photos/4321803/pexels-photo-4321803.jpeg'
    ],
    specifications: {
      capacity: '10 tons',
      height: '185-350mm',
      weight: '15kg',
      warranty: '2 years',
      manufacturer: 'YariIndustrial',
      countryOfOrigin: 'India'
    },
    rating: 4.8,
    reviews: 67,
    stock: 40
  },
  
  // Hand Tools
  {
    name: 'Professional Screwdriver Set',
    price: 3999,
    discount: 20,
    description: '32-piece professional screwdriver set with magnetic tips and ergonomic handles.',
    category: 'Hand Tools',
    subcategory: 'Screwdrivers',
    tags: ['screwdriver', 'set', 'professional', 'magnetic'],
    images: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
      'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg'
    ],
    specifications: {
      pieces: '32',
      material: 'Chrome Vanadium Steel',
      weight: '1.2kg',
      warranty: '5 years',
      manufacturer: 'YariTools',
      countryOfOrigin: 'India'
    },
    rating: 4.6,
    reviews: 287,
    stock: 120
  },
  {
    name: 'Adjustable Wrench Set',
    price: 2799,
    discount: 15,
    description: '3-piece adjustable wrench set with anti-slip grip and precision adjustment.',
    category: 'Hand Tools',
    subcategory: 'Wrenches',
    tags: ['wrench', 'adjustable', 'set', 'precision'],
    images: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
      'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg'
    ],
    sizes: ['8"', '10"', '12"'],
    specifications: {
      material: 'Chrome Vanadium Steel',
      weight: '1.8kg',
      warranty: '3 years',
      manufacturer: 'YariTools',
      countryOfOrigin: 'India'
    },
    rating: 4.5,
    reviews: 198,
    stock: 85
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
  },
  {
    name: 'Motor Brushes Set',
    price: 899,
    discount: 10,
    description: 'Universal motor brushes set for power tools and industrial equipment.',
    category: 'Spare Parts',
    subcategory: 'Motor Parts',
    tags: ['spare parts', 'motor', 'brushes', 'universal'],
    images: [
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      'https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg'
    ],
    specifications: {
      material: 'Carbon',
      weight: '50g',
      warranty: '3 months',
      manufacturer: 'YariParts',
      countryOfOrigin: 'India'
    },
    rating: 4.4,
    reviews: 156,
    stock: 200
  }
];

const addProducts = async () => {
  try {
    console.log('Starting to add products to Supabase...');
    
    // First, clear existing products to avoid duplicates
    console.log('Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products
    
    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 means no rows to delete, which is fine
      console.error('Error clearing existing products:', deleteError);
    } else {
      console.log('Existing products cleared successfully.');
    }
    
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
        console.log(`Added products: ${batch.map(p => `${p.name} (${p.category})`).join(', ')}`);
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
    
    // Show category distribution
    const categoryCount = sampleProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nCategory distribution:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
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