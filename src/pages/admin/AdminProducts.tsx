import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getCategories } from '../../utils/productUtils';
import { 
  Search, Plus, Edit, Trash2, X, Package, 
  DollarSign, Hash, Tag, Image, Palette, 
  Ruler, Box, Zap, Activity, MapPin, User,
  AlertCircle, CheckCircle, Info
} from 'lucide-react';

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

interface FormErrors {
  [key: string]: string;
}

// Move form components outside to prevent recreation on each render
const FormInput = React.memo(({ 
  label, 
  icon: Icon, 
  error, 
  helpText, 
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  ...props 
}: {
  label: string;
  icon?: any;
  error?: string;
  helpText?: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  [key: string]: any;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useMemo(() => `input-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
            error 
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          {...props}
        />
      </div>
      <div className="min-h-[1.25rem]">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="h-4 w-4 mr-1 flex-shrink-0" />
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
});

const FormTextarea = React.memo(({ 
  label, 
  icon: Icon, 
  error, 
  helpText, 
  required = false,
  rows = 3,
  value,
  onChange,
  placeholder,
  ...props 
}: {
  label: string;
  icon?: any;
  error?: string;
  helpText?: string;
  required?: boolean;
  rows?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  [key: string]: any;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useMemo(() => `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-vertical ${
            error 
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          {...props}
        />
      </div>
      <div className="min-h-[1.25rem]">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="h-4 w-4 mr-1 flex-shrink-0" />
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
});

const FormSelect = React.memo(({ 
  label, 
  icon: Icon, 
  error, 
  helpText, 
  required = false,
  value,
  onChange,
  children,
  ...props 
}: {
  label: string;
  icon?: any;
  error?: string;
  helpText?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const id = useMemo(() => `select-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
            error 
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          {...props}
        >
          {children}
        </select>
      </div>
      <div className="min-h-[1.25rem]">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="h-4 w-4 mr-1 flex-shrink-0" />
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
});

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form state with stable initial values
  const [formData, setFormData] = useState(() => ({
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
  }));

  // All available categories - comprehensive list
  const allCategories = useMemo(() => [
    'Power Tools',
    'Safety Equipment', 
    'Industrial Equipment',
    'Hand Tools',
    'Spare Parts'
  ], []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchCategories = useCallback(async () => {
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
  }, [allCategories]);

  const fetchProducts = useCallback(async () => {
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
  }, [selectedCategory]);

  // Stable validation function
  const validateForm = useCallback(() => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) errors.stock = 'Valid stock quantity is required';
    if (!formData.images.trim()) errors.images = 'At least one image URL is required';

    // Validate discount
    const discount = parseInt(formData.discount);
    if (formData.discount && (discount < 0 || discount > 100)) {
      errors.discount = 'Discount must be between 0 and 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
        colors: formData.colors ? formData.colors.split(',').map(color => color.trim()).filter(Boolean) : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(size => size.trim()).filter(Boolean) : null,
        stock: parseInt(formData.stock),
        specifications: {
          power: formData.specifications.power.trim() || null,
          voltage: formData.specifications.voltage.trim() || null,
          weight: formData.specifications.weight.trim() || null,
          dimensions: formData.specifications.dimensions.trim() || null,
          warranty: formData.specifications.warranty.trim() || null,
          manufacturer: formData.specifications.manufacturer.trim() || null,
          countryOfOrigin: formData.specifications.countryOfOrigin.trim() || null,
          material: formData.specifications.material.trim() || null
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
  }, [formData, validateForm, editingProduct, fetchProducts, fetchCategories]);

  const handleEdit = useCallback((product: Product) => {
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
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (productId: string) => {
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
  }, [fetchProducts]);

  const resetForm = useCallback(() => {
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
    setFormErrors({});
  }, []);

  // Stable change handlers with useCallback to prevent re-renders
  const handleInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  const handleSpecificationChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }, []);

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
                  Item ID
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
                  <td colSpan={6} className="px-6 py-4 text-center">
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
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        #{product.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {product.id.slice(-8)}
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-6 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white" id="modal-title">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {editingProduct ? 'Update the product information below.' : 'Fill in the details to add a new product to your inventory.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                        Basic Information
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <FormInput
                            label="Product Name"
                            icon={Tag}
                            required
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            placeholder="Enter a descriptive product name"
                            error={formErrors.name}
                            helpText="Use a clear, searchable name that customers will recognize"
                          />
                        </div>

                        <FormInput
                          label="Price"
                          icon={DollarSign}
                          type="number"
                          required
                          value={formData.price}
                          onChange={handleInputChange('price')}
                          placeholder="0.00"
                          error={formErrors.price}
                          helpText="Price in Indian Rupees (₹)"
                          step="0.01"
                          min="0"
                        />
                        
                        <FormInput
                          label="Discount Percentage"
                          icon={Tag}
                          type="number"
                          value={formData.discount}
                          onChange={handleInputChange('discount')}
                          placeholder="0"
                          error={formErrors.discount}
                          helpText="Optional discount (0-100%)"
                          min="0"
                          max="100"
                        />

                        <FormSelect
                          label="Category"
                          icon={Box}
                          required
                          value={formData.category}
                          onChange={handleInputChange('category')}
                          error={formErrors.category}
                          helpText="Select the main product category"
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </FormSelect>

                        <FormInput
                          label="Subcategory"
                          icon={Hash}
                          value={formData.subcategory}
                          onChange={handleInputChange('subcategory')}
                          placeholder="e.g., Drills, Grinders, Safety Gear"
                          helpText="Optional subcategory for better organization"
                        />

                        <FormInput
                          label="Stock Quantity"
                          icon={Package}
                          type="number"
                          required
                          value={formData.stock}
                          onChange={handleInputChange('stock')}
                          placeholder="0"
                          error={formErrors.stock}
                          helpText="Available quantity in inventory"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Product Details
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <FormTextarea
                            label="Description"
                            icon={Info}
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            placeholder="Describe the product features, benefits, and specifications..."
                            error={formErrors.description}
                            helpText="Detailed description to help customers understand the product"
                          />
                        </div>

                        <FormInput
                          label="Tags"
                          icon={Tag}
                          value={formData.tags}
                          onChange={handleInputChange('tags')}
                          placeholder="professional, heavy-duty, durable, industrial"
                          helpText="Separate multiple tags with commas"
                        />

                        <div className="lg:col-span-1">
                          <FormTextarea
                            label="Image URLs"
                            icon={Image}
                            required
                            rows={3}
                            value={formData.images}
                            onChange={handleInputChange('images')}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            error={formErrors.images}
                            helpText="Separate multiple image URLs with commas"
                          />
                        </div>

                        <FormInput
                          label="Available Colors"
                          icon={Palette}
                          value={formData.colors}
                          onChange={handleInputChange('colors')}
                          placeholder="Red, Blue, Black, Yellow"
                          helpText="Separate colors with commas (optional)"
                        />
                        
                        <FormInput
                          label="Available Sizes"
                          icon={Ruler}
                          value={formData.sizes}
                          onChange={handleInputChange('sizes')}
                          placeholder="Small, Medium, Large, XL"
                          helpText="Separate sizes with commas (optional)"
                        />
                      </div>
                    </div>

                    {/* Specifications Section */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Technical Specifications
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormInput
                          label="Power"
                          icon={Zap}
                          value={formData.specifications.power}
                          onChange={handleSpecificationChange('power')}
                          placeholder="1200W"
                          helpText="Power consumption or output"
                        />
                        
                        <FormInput
                          label="Voltage"
                          icon={Zap}
                          value={formData.specifications.voltage}
                          onChange={handleSpecificationChange('voltage')}
                          placeholder="230V AC"
                          helpText="Operating voltage"
                        />
                        
                        <FormInput
                          label="Weight"
                          icon={Package}
                          value={formData.specifications.weight}
                          onChange={handleSpecificationChange('weight')}
                          placeholder="2.5kg"
                          helpText="Product weight with packaging"
                        />
                        
                        <FormInput
                          label="Dimensions"
                          icon={Ruler}
                          value={formData.specifications.dimensions}
                          onChange={handleSpecificationChange('dimensions')}
                          placeholder="25 x 15 x 10 cm"
                          helpText="Length x Width x Height"
                        />
                        
                        <FormInput
                          label="Warranty"
                          icon={CheckCircle}
                          value={formData.specifications.warranty}
                          onChange={handleSpecificationChange('warranty')}
                          placeholder="2 years"
                          helpText="Warranty period"
                        />
                        
                        <FormInput
                          label="Manufacturer"
                          icon={User}
                          value={formData.specifications.manufacturer}
                          onChange={handleSpecificationChange('manufacturer')}
                          placeholder="YariTools Pro"
                          helpText="Brand or manufacturer name"
                        />
                        
                        <FormInput
                          label="Country of Origin"
                          icon={MapPin}
                          value={formData.specifications.countryOfOrigin}
                          onChange={handleSpecificationChange('countryOfOrigin')}
                          placeholder="India"
                          helpText="Manufacturing country"
                        />
                        
                        <FormInput
                          label="Material"
                          icon={Box}
                          value={formData.specifications.material}
                          onChange={handleSpecificationChange('material')}
                          placeholder="High-grade steel"
                          helpText="Primary construction material"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Info className="h-4 w-4 mr-1" />
                    All required fields must be filled before saving
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`inline-flex justify-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-colors ${
                        submitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        editingProduct ? 'Update Product' : 'Add Product'
                      )}
                    </button>
                  </div>
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