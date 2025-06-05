import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryProps {
  category: {
    id: string;
    name: string;
    description: string;
    image: string;
    link: string;
  };
}

const CategoryPreview: React.FC<CategoryProps> = ({ category }) => {
  const { t } = useLanguage();
  
  return (
    <Link
      to={category.link}
      className="group relative overflow-hidden rounded-lg shadow-md h-80"
    >
      <img
        src={category.image}
        alt={category.name}
        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent flex flex-col items-center justify-end text-white p-6 text-center">
        <h3 className="text-xl font-bold mb-2">{category.name}</h3>
        <p className="text-sm text-gray-200 mb-4">{category.description}</p>
        <span className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white group-hover:bg-white group-hover:text-gray-900 dark:group-hover:text-gray-900 transition">
          {t('home.sections.shopNow') || 'Shop Now'}
        </span>
      </div>
    </Link>
  );
};

export default CategoryPreview;