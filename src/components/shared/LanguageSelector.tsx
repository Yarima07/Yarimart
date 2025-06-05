import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ml' | 'hi')}
        className="block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-primary-500 focus:ring-primary-500 
                   dark:border-gray-600 dark:bg-gray-700 dark:text-white
                   py-2 pl-3 pr-10 text-sm"
        aria-label={t('common.language')}
      >
        <option value="en">{t('common.english')}</option>
        <option value="ml">{t('common.malayalam')}</option>
        <option value="hi">{t('common.hindi')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;