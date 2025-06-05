import React from 'react';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { Building2, Users, Trophy, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  
  const milestones = [
    { year: '1995', title: 'Founded', description: 'Started as a small tool shop in Kerala' },
    { year: '2005', title: 'Expansion', description: 'Opened multiple branches across South India' },
    { year: '2015', title: 'Manufacturing', description: 'Started our own manufacturing unit' },
    { year: '2024', title: 'Digital Transformation', description: 'Launched our e-commerce platform' },
  ];

  const values = [
    {
      icon: Users,
      title: 'Customer First',
      description: 'We prioritize customer satisfaction in everything we do'
    },
    {
      icon: Trophy,
      title: 'Quality Excellence',
      description: 'We maintain the highest standards in our products and services'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We continuously evolve and adapt to market needs'
    },
    {
      icon: Building2,
      title: 'Integrity',
      description: 'We conduct our business with honesty and transparency'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'About Us' }
        ]} 
      />

      {/* Hero Section */}
      <div className="mt-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About Yarimart</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Your trusted partner in professional tools and industrial equipment since 1995
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="bg-primary-50 dark:bg-primary-900/30 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-primary-800 dark:text-primary-100">
            To provide high-quality industrial tools and equipment while delivering exceptional service and technical support to our customers.
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/30 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Our Vision</h2>
          <p className="text-primary-800 dark:text-primary-100">
            To be the leading provider of industrial tools and equipment in India, known for quality, innovation, and customer service.
          </p>
        </div>
      </div>

      {/* Company Values */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-16 dark:text-white">Our Journey</h2>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-primary-100 dark:from-primary-600 dark:to-primary-900/30"></div>
          
          {/* Timeline Items */}
          <div className="space-y-24">
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Content */}
                <div className="flex-1 md:w-1/2">
                  <div className={`relative p-6 ${
                    index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                  }`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105 hover:shadow-xl">
                      <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">{milestone.year}</span>
                      <h3 className="text-xl font-bold mt-2 dark:text-white">{milestone.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{milestone.description}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Point */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-full border-4 border-white dark:border-gray-900 shadow"></div>
                </div>

                {/* Empty Space for Layout */}
                <div className="flex-1 md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-24 text-center bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Join Us in Our Journey</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience the difference of working with a company that puts quality and customer satisfaction first.
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transform transition-transform hover:scale-105"
          >
            Contact Us
          </a>
          <a 
            href="/careers" 
            className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 dark:border-primary-500 transform transition-transform hover:scale-105"
          >
            View Careers
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;