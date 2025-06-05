import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {/* Brand & Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Yarimart</h3>
              <p className="text-gray-300 text-sm max-w-xs">
                Your trusted source for professional-grade tools and industrial equipment since 1995.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-gray-300">
                <Phone size={20} className="flex-shrink-0 text-primary-400" />
                <div className="text-sm">
                  <p className="text-white">{t('footer.support')}:</p>
                  <p>+917594888505</p>
                  <p>+917594888504</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-300">
                <MapPin size={20} className="flex-shrink-0 text-primary-400" />
                <span className="text-sm">{t('footer.address')}</span>
              </div>
            </div>

            <div className="flex space-x-5">
              <a href="https://www.instagram.com/yarima_business_group" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 p-2 rounded-full text-gray-300 hover:text-white hover:bg-primary-600 transition-colors duration-300">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/yarimaind" target="_blank" rel="noopener noreferrer"
                 className="bg-gray-800 p-2 rounded-full text-gray-300 hover:text-white hover:bg-primary-600 transition-colors duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com/YarimaTools" target="_blank" rel="noopener noreferrer"
                 className="bg-gray-800 p-2 rounded-full text-gray-300 hover:text-white hover:bg-primary-600 transition-colors duration-300">
                <Twitter size={18} />
              </a>
              <a href="mailto:yarimaind@gmail.com"
                 className="bg-gray-800 p-2 rounded-full text-gray-300 hover:text-white hover:bg-primary-600 transition-colors duration-300">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">{t('footer.products')}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <li>
                <Link to="/catalog/power-tools" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Power Tools
                </Link>
              </li>
              <li>
                <Link to="/catalog/hand-tools" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Hand Tools
                </Link>
              </li>
              <li>
                <Link to="/catalog/industrial" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Industrial Equipment
                </Link>
              </li>
              <li>
                <Link to="/catalog/safety" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Safety Equipment
                </Link>
              </li>
              <li>
                <Link to="/catalog/spare-parts" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Spare Parts
                </Link>
              </li>
              <li>
                <Link to="/catalog/new" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">{t('footer.company')}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Store Locations
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section with Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div>
              <p className="text-sm text-gray-400">{t('footer.copyright').replace('{year}', currentYear.toString())}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition">
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a href="/terms" className="text-sm text-gray-400 hover:text-white transition">
                Terms of Service
              </a>
              <span className="text-gray-600">•</span>
              <a href="/sitemap" className="text-sm text-gray-400 hover:text-white transition">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;