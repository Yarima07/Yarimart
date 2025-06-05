import 'dotenv/config'; // Load environment variables from .env file
import { supabase } from '../src/lib/supabase';
import { getProducts } from '../src/utils/productUtils';

const migrateProducts = async () => {
  try {
    console.log('Starting product migration...');
    const products = getProducts();
    
    console.log(`Found ${products.length} products to migrate.`);
    
    // Batch products in groups of 20 to avoid hitting rate limits
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }
    
    console.log(`Split into ${batches.length} batches for processing.`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length}...`);
      
      // Map products to the database schema
      const productsToInsert = batch.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory || null,
        tags: product.tags,
        images: product.images,
        colors: product.colors || null,
        sizes: product.sizes || null,
        specifications: product.specifications,
        details: product.details || null,
        rating: product.rating,
        reviews: product.reviews,
        created_at: new Date(product.createdAt),
        stock: product.stock
      }));
      
      // Insert products
      const { data, error } = await supabase
        .from('products')
        .upsert(productsToInsert, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
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
    
    console.log('Migration completed.');
    console.log(`Total products: ${products.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('Some products failed to migrate. Check the logs above for details.');
    } else {
      console.log('All products were migrated successfully!');
    }
    
  } catch (error) {
    console.error('Migration failed with error:', error);
  } finally {
    // Close the Supabase client connection
    await supabase.auth.signOut();
  }
};

migrateProducts().catch(console.error);