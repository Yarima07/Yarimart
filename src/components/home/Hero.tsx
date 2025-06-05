import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg"
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl mb-8">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/catalog/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-900 bg-white hover:bg-gray-100 transition"
            >
              {t('home.hero.cta1')}
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 transition"
            >
              {t('home.hero.cta2')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;