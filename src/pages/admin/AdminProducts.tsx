import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Edit, Trash2, AlertCircle, Star, X, Upload, Save, Image } from 'lucide-react';
import { Product } from '../../types/product';

interface FormData {
  id: string;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  images: string[];
  colors: string[];
  sizes: string[];
  specifications: {
    power?: string;
    voltage?: string;
    weight?: string;
    dimensions?: string;
    warranty?: string;
    manufacturer?: string;
    countryOfOrigin?: string;
    material?: string;
  };
  details: {
    [key: string]: string;
  };
  rating: number;
  reviews: number;
  stock: number;
}

const DEFAULT_FORM_DATA: FormData = {
  id: '',
  name: '',
  price: 0,
  discount: 0,
  description: '',
  category: '',
  subcategory: '',
  tags: [],
  images: [],
  colors: [],
  sizes: [],
  specifications: {
    power: '',
    voltage: '',
    weight: '',
    dimensions: '',
    warranty: '',
    manufacturer: '',
    countryOfOrigin: '',
    material: '',
  },
  details: {},
  rating: 0,
  reviews: 0,
  stock: 0
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Delete product state
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Add/Edit product state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // New tag, color, size, image inputs
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newImage, setNewImage] = useState('');
  
  // New specification and detail key-value pairs
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newDetailKey, setNewDetailKey] = useState('');
  const [newDetailValue, setNewDetailValue] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('[ADMIN-PRODUCTS] Fetching products');
      let query = supabase.from('products').select('*');
      
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[ADMIN-PRODUCTS] Error fetching products:', error);
        throw error;
      }
      
      setProducts(data as Product[] || []);
      console.log(`[ADMIN-PRODUCTS] Fetched ${data?.length || 0} products`);
      
      // Extract unique categories
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(product => product.category)));
        setCategories(uniqueCategories);
        console.log(`[ADMIN-PRODUCTS] Found ${uniqueCategories.length} unique categories`);
      }
    } catch (error) {
      console.error('[ADMIN-PRODUCTS] Error in fetchProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add product modal
  const openAddProductForm = () => {
    setFormMode('add');
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setIsProductFormOpen(true);
  };

  // Edit product modal
  const openEditProductForm = (product: Product) => {
    setFormMode('edit');
    
    // Transform product data to form data
    const formattedProduct: FormData = {
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      tags: product.tags || [],
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      specifications: product.specifications || {
        power: '',
        voltage: '',
        weight: '',
        dimensions: '',
        warranty: '',
        manufacturer: '',
        countryOfOrigin: '',
        material: '',
      },
      details: product.details || {},
      rating: product.rating,
      reviews: product.reviews,
      stock: product.stock
    };
    
    setFormData(formattedProduct);
    setFormErrors({});
    setIsProductFormOpen(true);
  };

  // Delete product confirmation
  const confirmDelete = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProductId);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.filter(product => product.id !== deleteProductId));
      setIsDeleteModalOpen(false);
      setDeleteProductId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'price' || name === 'stock' || name === 'discount') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle specification changes
  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  // Add a new specification
  const addSpecification = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey]: newSpecValue
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  // Remove a specification
  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  // Handle detail changes
  const handleDetailChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
  };

  // Add a new detail
  const addDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDetailKey && newDetailValue) {
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [newDetailKey]: newDetailValue
        }
      }));
      setNewDetailKey('');
      setNewDetailValue('');
    }
  };

  // Remove a detail
  const removeDetail = (key: string) => {
    setFormData(prev => {
      const newDetails = { ...prev.details };
      delete newDetails[key];
      return {
        ...prev,
        details: newDetails
      };
    });
  };

  // Add tag
  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Add color
  const addColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  // Add size
  const addSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
      setNewSize('');
    }
  };

  // Remove size
  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  // Add image URL
  const addImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImage && !formData.images.includes(newImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImage('');
    }
  };

  // Remove image
  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name) errors.name = "Name is required";
    if (formData.price <= 0) errors.price = "Price must be greater than zero";
    if (formData.discount < 0 || formData.discount > 100) errors.discount = "Discount must be between 0 and 100";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.category) errors.category = "Category is required";
    if (formData.images.length === 0) errors.images = "At least one image URL is required";
    if (formData.stock < 0) errors.stock = "Stock cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (formMode === 'add') {
        // Add new product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            price: formData.price,
            discount: formData.discount,
            description: formData.description,
            category: formData.category,
            subcategory: formData.subcategory || null,
            tags: formData.tags,
            images: formData.images,
            colors: formData.colors.length ? formData.colors : null,
            sizes: formData.sizes.length ? formData.sizes : null,
            specifications: Object.keys(formData.specifications).length ? formData.specifications : null,
            details: Object.keys(formData.details).length ? formData.details : null,
            rating: formData.rating,
            reviews: formData.reviews,
            stock: formData.stock
          }])
          .select();
          
        if (error) throw error;
        
        if (data) {
          setProducts([...products, data[0] as Product]);
        }
        
      } else {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            price: formData.price,
            discount: formData.discount,
            description: formData.description,
            category: formData.category,
            subcategory: formData.subcategory || null,
            tags: formData.tags,
            images: formData.images,
            colors: formData.colors.length ? formData.colors : null,
            sizes: formData.sizes.length ? formData.sizes : null,
            specifications: Object.keys(formData.specifications).length ? formData.specifications : null,
            details: Object.keys(formData.details).length ? formData.details : null,
            rating: formData.rating,
            reviews: formData.reviews,
            stock: formData.stock
          })
          .eq('id', formData.id)
          .select();
          
        if (error) throw error;
        
        if (data) {
          setProducts(products.map(p => p.id === formData.id ? (data[0] as Product) : p));
        }
      }
      
      setIsProductFormOpen(false);
      fetchProducts(); // Refresh product list
      
    } catch (error) {
      console.error('Error saving product:', error);
      setFormErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while saving the product'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchString = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchString) ||
      product.description.toLowerCase().includes(searchString) ||
      product.category.toLowerCase().includes(searchString) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(searchString))
    );
  });

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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button 
            onClick={openAddProductForm}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
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
                  Rating
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
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.images[0]} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                      {product.subcategory && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{product.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(product.price * (1 - product.discount / 100))}
                      </div>
                      {product.discount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        product.stock > 10 
                          ? 'text-green-600 dark:text-green-400' 
                          : product.stock > 0 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 text-sm text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditProductForm(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(product.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteProduct}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !isSaving && setIsProductFormOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => !isSaving && setIsProductFormOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
                </h3>

                <form onSubmit={handleSubmit} className="mt-4">
                  {formErrors.submit && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400\" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-400">{formErrors.submit}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Product Name*
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                            ${formErrors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          required
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description*
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                            ${formErrors.description ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          required
                        ></textarea>
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category*
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                            ${formErrors.category ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.length > 0 ? (
                            categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))
                          ) : (
                            <>
                              <option value="Power Tools">Power Tools</option>
                              <option value="Hand Tools">Hand Tools</option>
                              <option value="Safety Equipment">Safety Equipment</option>
                              <option value="Industrial Equipment">Industrial Equipment</option>
                              <option value="Spare Parts">Spare Parts</option>
                            </>
                          )}
                        </select>
                        {formErrors.category && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.category}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subcategory
                        </label>
                        <input
                          type="text"
                          id="subcategory"
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price (₹)*
                          </label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                              ${formErrors.price ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            required
                          />
                          {formErrors.price && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.price}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            id="discount"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                              ${formErrors.discount ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          />
                          {formErrors.discount && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.discount}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stock*
                        </label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          min="0"
                          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm
                            ${formErrors.stock ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          required
                        />
                        {formErrors.stock && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.stock}</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-6">
                      {/* Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Images*
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <div className="h-16 w-16 rounded-md overflow-hidden">
                                <img src={img} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(img)}
                                className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {formData.images.length === 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No images added</div>
                          )}
                        </div>
                        {formErrors.images && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-2">{formErrors.images}</p>
                        )}
                        <div className="flex">
                          <input
                            type="url"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={addImage}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-md transition dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            <Image className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter image URLs for your product. We recommend using Pexels or similar royalty-free image services.
                        </p>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1.5 inline-flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-md transition dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Colors
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.colors.map(color => (
                            <span 
                              key={color} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                            >
                              {color}
                              <button
                                type="button"
                                onClick={() => removeColor(color)}
                                className="ml-1.5 inline-flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            placeholder="Add a color"
                            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={addColor}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-md transition dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sizes
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.sizes.map(size => (
                            <span 
                              key={size} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="ml-1.5 inline-flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="Add a size"
                            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={addSize}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-md transition dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Specifications</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {Object.entries(formData.specifications).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex flex-col space-y-1">
                              <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeSpecification(key)}
                                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleSpecificationChange(key, e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                              />
                            </div>
                          )
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          placeholder="Key (e.g. weight)"
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        <input
                          type="text"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          placeholder="Value (e.g. 2.5kg)"
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={addSpecification}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                          disabled={!newSpecKey || !newSpecValue}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Additional Details</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {Object.entries(formData.details).map(([key, value]) => (
                          <div key={key} className="flex flex-col space-y-1">
                            <div className="flex justify-between">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </label>
                              <button
                                type="button"
                                onClick={() => removeDetail(key)}
                                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleDetailChange(key, e.target.value)}
                              className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      {Object.keys(formData.details).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No additional details yet. Add some below.</p>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newDetailKey}
                          onChange={(e) => setNewDetailKey(e.target.value)}
                          placeholder="Key (e.g. material)"
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        <input
                          type="text"
                          value={newDetailValue}
                          onChange={(e) => setNewDetailValue(e.target.value)}
                          placeholder="Value (e.g. stainless steel)"
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={addDetail}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                          disabled={!newDetailKey || !newDetailValue}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsProductFormOpen(false)}
                      disabled={isSaving}
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                            <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {formMode === 'add' ? 'Add Product' : 'Update Product'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;