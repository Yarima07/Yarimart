import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getCategories } from '../../utils/productUtils';
import { Search, Plus, Edit, Trash2, X, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  colors?: string[];
  sizes?: string[];
  specifications: any;
  details?: any;
  rating: number;
  reviews: number;
  created_at: string;
  stock: number;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '',
    description: '',
    category: '',
    subcategory: '',
    tags: '',
    images: '',
    colors: '',
    sizes: '',
    stock: '',
    specifications: {
      power: '',
      voltage: '',
      weight: '',
      dimensions: '',
      warranty: '',
      manufacturer: '',
      countryOfOrigin: '',
      material: ''
    }
  });

  // All available categories - comprehensive list
  const allCategories = [
    'Power Tools',
    'Safety Equipment', 
    'Industrial Equipment',
    'Hand Tools',
    'Spare Parts'
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from database...');
      const dbCategories = await getCategories();
      console.log('Database categories:', dbCategories);
      
      if (dbCategories.length > 0) {
        // Combine database categories with all categories to ensure we have the complete list
        const uniqueCategories = [...new Set([...allCategories, ...dbCategories])];
        setCategories(uniqueCategories);
        console.log('Using combined categories:', uniqueCategories);
      } else {
        // Use all predefined categories if database is empty
        setCategories(allCategories);
        console.log('Using predefined categories:', allCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Always fallback to all categories
      setCategories(allCategories);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
        colors: formData.colors ? formData.colors.split(',').map(color => color.trim()).filter(Boolean) : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(size => size.trim()).filter(Boolean) : null,
        stock: parseInt(formData.stock),
        specifications: {
          power: formData.specifications.power || null,
          voltage: formData.specifications.voltage || null,
          weight: formData.specifications.weight || null,
          dimensions: formData.specifications.dimensions || null,
          warranty: formData.specifications.warranty || null,
          manufacturer: formData.specifications.manufacturer || null,
          countryOfOrigin: formData.specifications.countryOfOrigin || null,
          material: formData.specifications.material || null
        },
        rating: 0,
        reviews: 0
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        console.log('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        console.log('Product added successfully');
      }

      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
      setEditingProduct(null);
      
      // Refresh products list
      await fetchProducts();
      
      // Refresh categories in case a new one was added
      await fetchCategories();
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discount: product.discount.toString(),
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      tags: product.tags.join(', '),
      images: product.images.join(', '),
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      stock: product.stock.toString(),
      specifications: {
        power: product.specifications?.power || '',
        voltage: product.specifications?.voltage || '',
        weight: product.specifications?.weight || '',
        dimensions: product.specifications?.dimensions || '',
        warranty: product.specifications?.warranty || '',
        manufacturer: product.specifications?.manufacturer || '',
        countryOfOrigin: product.specifications?.countryOfOrigin || '',
        material: product.specifications?.material || ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      await fetchProducts();
      console.log('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      discount: '',
      description: '',
      category: '',
      subcategory: '',
      tags: '',
      images: '',
      colors: '',
      sizes: '',
      stock: '',
      specifications: {
        power: '',
        voltage: '',
        weight: '',
        dimensions: '',
        warranty: '',
        manufacturer: '',
        countryOfOrigin: '',
        material: ''
      }
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white min-w-48"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map(category => {
            const categoryCount = products.filter(p => p.category === category).length;
            return (
              <option key={category} value={category}>
                {category} ({categoryCount})
              </option>
            );
          })}
        </select>
      </div>

      {/* Categories Overview */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(category => {
          const categoryProducts = products.filter(p => p.category === category);
          const isSelected = selectedCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Package className={`h-6 w-6 mx-auto mb-2 ${
                isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
              }`} />
              <div className="text-sm font-medium dark:text-white">{category}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{categoryProducts.length} products</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="animate-pulse flex justify-center">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.images[0] || '/placeholder-image.jpg'}
                            alt={product.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.description.length > 50 
                              ? `${product.description.substring(0, 50)}...`
                              : product.description
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                      {product.subcategory && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{product.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                      {product.discount > 0 && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                          {product.discount}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No products found matching your search.' : 'No products found in this category.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Basic Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter product name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory</label>
                        <input
                          type="text"
                          value={formData.subcategory}
                          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Drills, Grinders"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Product Details</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Describe the product features and benefits"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="professional, heavy-duty, durable"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate tags with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Images *</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.images}
                          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate image URLs with commas</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Colors</label>
                          <input
                            type="text"
                            value={formData.colors}
                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                            placeholder="Red, Blue, Black"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sizes</label>
                          <input
                            type="text"
                            value={formData.sizes}
                            onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                            placeholder="S, M, L, XL"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Power</label>
                        <input
                          type="text"
                          value={formData.specifications.power}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, power: e.target.value }
                          })}
                          placeholder="1200W"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voltage</label>
                        <input
                          type="text"
                          value={formData.specifications.voltage}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, voltage: e.target.value }
                          })}
                          placeholder="230V"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                        <input
                          type="text"
                          value={formData.specifications.weight}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, weight: e.target.value }
                          })}
                          placeholder="2.5kg"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Warranty</label>
                        <input
                          type="text"
                          value={formData.specifications.warranty}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, warranty: e.target.value }
                          })}
                          placeholder="2 years"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturer</label>
                        <input
                          type="text"
                          value={formData.specifications.manufacturer}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, manufacturer: e.target.value }
                          })}
                          placeholder="YariTools Pro"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country of Origin</label>
                        <input
                          type="text"
                          value={formData.specifications.countryOfOrigin}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            specifications: { ...formData.specifications, countryOfOrigin: e.target.value }
                          })}
                          placeholder="India"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
                    }`}
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;