import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Star, Heart, ShoppingBag } from 'lucide-react';
import { getProductById, getRelatedProducts } from '../utils/productUtils';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import ProductCard from '../components/shared/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/product';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        if (id) {
          const foundProduct = await getProductById(id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            // Set default selections
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
              setSelectedSize(foundProduct.sizes[0]);
            }
            
            // Fetch related products
            const related = await getRelatedProducts(foundProduct.id, foundProduct.category);
            setRelatedProducts(related);
            
            // Check if in wishlist
            setIsWishlisted(isInWishlist(foundProduct.id));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id, isInWishlist]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        selectedSize: selectedSize || '',
        selectedColor: ''
      }, quantity);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product);
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    
    // Simulate API call to submit review
    setTimeout(() => {
      setSubmittingReview(false);
      setReviewSuccess(true);
      setReviewText('');
      setReviewRating(5);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Sample reviews data - in a real app, this would come from the database
  const reviews = [
    {
      id: 1,
      userName: 'Rahul Sharma',
      rating: 5,
      date: '2024-05-15',
      text: 'Excellent product! It has greatly improved my workflow and the quality is outstanding.'
    },
    {
      id: 2,
      userName: 'Priya Patel',
      rating: 4,
      date: '2024-05-10',
      text: 'Very good product. Durable and well-made. Only giving 4 stars because delivery was a bit delayed.'
    },
    {
      id: 3,
      userName: 'Amit Kumar',
      rating: 5,
      date: '2024-05-02',
      text: 'Perfect for my needs. The product exceeded my expectations in terms of performance and build quality.'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-xl text-gray-500 dark:text-gray-400">Product not found.</p>
        <Link 
          to="/catalog"
          className="inline-block mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: product.category, href: `/catalog/${product.category.toLowerCase()}` },
          { name: product.name }
        ]} 
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                  activeImage === index 
                    ? 'ring-2 ring-primary-500' 
                    : 'ring-1 ring-gray-200 dark:ring-gray-600'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          
          {/* Rating */}
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {product.reviews} {t('product.reviews')}
            </span>
          </div>

          {/* Price */}
          <div className="mt-4">
            {product.discount > 0 ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{"$" + finalPrice.toFixed(2)}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400 line-through">{"$" + product.price.toFixed(2)}</span>
                <span className="ml-2 bg-accent-100 dark:bg-accent-800 text-accent-800 dark:text-accent-100 text-xs font-medium px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{"$" + product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('product.sizeGuide')}</h3>
                <Link to="/size-guide" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                  {t('product.sizeGuide')}
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center text-sm font-medium rounded-md ${
                      selectedSize === size
                        ? 'bg-primary-600 text-white dark:bg-primary-700'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('product.quantity')}</h3>
            <div className="flex items-center mt-2">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 rounded-l-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Minus size={16} className="dark:text-white" />
              </button>
              <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-200 dark:border-gray-600 dark:text-white">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="w-10 h-10 rounded-r-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Plus size={16} className="dark:text-white" />
              </button>
            </div>
          </div>

          {/* Add to Cart and Wishlist */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white py-3 px-6 rounded-md flex items-center justify-center font-medium transition"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {t('product.addToCart')}
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`w-12 h-12 rounded-md flex items-center justify-center border ${
                isWishlisted 
                  ? 'bg-primary-50 dark:bg-primary-900 text-accent-500 border-accent-500' 
                  : 'text-gray-400 border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Heart className={isWishlisted ? 'fill-accent-500' : ''} size={20} />
            </button>
          </div>

          {/* Additional information */}
          <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
            <div className="mt-4 space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium dark:text-gray-300">Free shipping</span> on orders over $50
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium dark:text-gray-300">Easy returns</span> within 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab('details')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('product.details')}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('product.reviews')} ({product.reviews})
            </button>
            <button 
              onClick={() => setActiveTab('shipping')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shipping' 
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('product.shipping')}
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'details' && (
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="dark:text-white">{t('product.details')}</h3>
              <p className="dark:text-gray-300">{product.description}</p>
              <ul className="dark:text-gray-300">
                <li>Material: {product.specifications?.material || 'Not specified'}</li>
                <li>Country of Origin: {product.specifications?.countryOfOrigin || 'Not specified'}</li>
                <li>Care: Hand wash or machine wash cold</li>
              </ul>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold mb-6 dark:text-white">Customer Reviews</h3>
              
              {/* Review statistics */}
              <div className="flex items-center mb-8">
                <div className="mr-6">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</div>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Based on {product.reviews} reviews
                  </div>
                </div>
                
                <div className="flex-1 max-w-md">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center mb-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400 w-4">{star}</div>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1 mr-2" />
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ 
                            width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 w-8">
                        {star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '7%' : star === 2 ? '2%' : '1%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write a review */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
                <h4 className="text-lg font-medium mb-4 dark:text-white">Write a Review</h4>
                
                {user ? (
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="mr-1"
                          >
                            <Star 
                              className={`h-6 w-6 ${
                                rating <= reviewRating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300 dark:text-gray-600'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="review"
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Share your experience with this product..."
                      ></textarea>
                    </div>
                    
                    {reviewSuccess && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                        Your review has been submitted successfully. Thank you for your feedback!
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewText.trim()}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        submittingReview || !reviewText.trim()
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
                      }`}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Please sign in to leave a review.
                    </p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Reviews list */}
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium dark:text-white">{review.userName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'shipping' && (
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="dark:text-white">Shipping & Returns</h3>
              <h4 className="dark:text-white">Shipping Policy</h4>
              <ul className="dark:text-gray-300">
                <li>Free shipping on orders above ₹5,000</li>
                <li>Standard shipping (3-5 business days): ₹100</li>
                <li>Express shipping (1-2 business days): ₹250</li>
                <li>Shipping available throughout India</li>
              </ul>
              
              <h4 className="dark:text-white mt-6">Return Policy</h4>
              <p className="dark:text-gray-300">
                We accept returns within 30 days of delivery for most products. Items must be unused, undamaged, and in their original packaging.
              </p>
              <p className="dark:text-gray-300">
                For defective items, we offer replacements or full refunds within 7 days of delivery.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 dark:text-white">{t('product.relatedProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;