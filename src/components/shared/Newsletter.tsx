import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // In a real app, you would send this to your backend
      console.log('Subscribing email:', email);
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-primary-900 text-white py-16 dark:bg-primary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('newsletter.title') || 'Join Our Newsletter'}</h2>
        <p className="text-gray-300 max-w-md mx-auto mb-8">
          {t('newsletter.subtitle') || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'}
        </p>
        
        {subscribed ? (
          <div className="bg-primary-800 dark:bg-primary-900 p-4 rounded-md inline-block">
            <p className="text-lg">{t('newsletter.thanks') || 'Thank you for subscribing!'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder={t('newsletter.placeholder') || 'Your email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-3 rounded-l-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              required
            />
            <button
              type="submit"
              className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700 px-6 py-3 rounded-r-md font-medium transition"
            >
              {t('newsletter.button') || 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;