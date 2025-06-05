import React from 'react';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { Briefcase, MapPin, Clock, IndianRupee } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CareersPage: React.FC = () => {
  const { t } = useLanguage();
  
  const benefits = [
    'Competitive salary package',
    'Health insurance coverage',
    'Professional development opportunities',
    'Performance bonuses',
    'Flexible work hours',
    'Career growth opportunities'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Careers' }
        ]} 
      />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Join Our Team</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Build your career with Yarimart and be part of our mission to provide quality industrial solutions
        </p>
      </div>

      {/* Benefits Section */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Why Join Yarimart?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <p className="text-gray-800 dark:text-gray-200">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* No Current Openings */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 dark:text-white">Current Openings</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">No Active Openings</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            We don't have any open positions at the moment, but we're always looking for talented individuals to join our team.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            Please check back later or send your resume to our HR team to be considered for future opportunities.
          </p>
          <a
            href="mailto:careers@yarimart.com"
            className="inline-flex items-center px-6 py-3 mt-6 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <Briefcase className="w-5 h-5 mr-2" />
            Send Your Resume
          </a>
        </div>
      </div>

      {/* Application Process */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Application Process</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2 dark:text-white">Submit Application</h3>
            <p className="text-gray-600 dark:text-gray-400">Apply online with your resume and cover letter</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 dark:text-primary-400 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2 dark:text-white">Interview Process</h3>
            <p className="text-gray-600 dark:text-gray-400">Multiple rounds of interviews with the team</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 dark:text-primary-400 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2 dark:text-white">Offer & Onboarding</h3>
            <p className="text-gray-600 dark:text-gray-400">Receive offer and join our team</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Questions?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Contact our HR team for any queries about future openings or application process
        </p>
        <a
          href="mailto:careers@yarimart.com"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          <Briefcase className="w-5 h-5 mr-2" />
          Contact HR
        </a>
      </div>
    </div>
  );
};

export default CareersPage;