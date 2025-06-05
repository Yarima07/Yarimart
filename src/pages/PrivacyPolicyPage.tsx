import React from 'react';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Privacy Policy' }
        ]} 
      />

      <h1 className="text-3xl font-bold mb-8 dark:text-white">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Last updated: May 23, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">1. Introduction</h2>
          <p className="dark:text-gray-300">
            Yarimart ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">2. Information We Collect</h2>
          <p className="mb-4 dark:text-gray-300">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mb-4 dark:text-gray-300">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Shipping address</li>
            <li>Purchase history</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">3. How We Use Your Information</h2>
          <p className="mb-4 dark:text-gray-300">We use the information we collect to:</p>
          <ul className="list-disc pl-6 dark:text-gray-300">
            <li>Process your orders and payments</li>
            <li>Communicate with you about your orders</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">4. Data Security</h2>
          <p className="dark:text-gray-300">
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">5. Your Rights</h2>
          <p className="mb-4 dark:text-gray-300">You have the right to:</p>
          <ul className="list-disc pl-6 dark:text-gray-300">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">6. Cookies</h2>
          <p className="dark:text-gray-300">
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">7. Contact Us</h2>
          <p className="dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none pl-6 mt-4 dark:text-gray-300">
            <li>Email: privacy@yarimart.com</li>
            <li>Phone: +91 759 488 8505</li>
            <li>Address: 123 Industrial Area, Kochi, Kerala 682021</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;