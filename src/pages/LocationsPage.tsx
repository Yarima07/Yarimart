import React from 'react';
import BreadcrumbNav from '../components/shared/BreadcrumbNav';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LocationsPage: React.FC = () => {
  const { t } = useLanguage();
  
  const locations = [
    {
      id: 1,
      name: 'Kochi Headquarters',
      address: '123 Industrial Area, Kochi, Kerala 682021',
      phone: '+91 759 488 8505',
      email: 'kochi@yarimart.com',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg'
    },
    {
      id: 2,
      name: 'Trivandrum Branch',
      address: '456 Tech Park, Trivandrum, Kerala 695581',
      phone: '+91 759 488 8504',
      email: 'tvm@yarimart.com',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg'
    },
    {
      id: 3,
      name: 'Calicut Branch',
      address: '789 Business Center, Calicut, Kerala 673001',
      phone: '+91 759 488 8503',
      email: 'calicut@yarimart.com',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      image: 'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbNav 
        items={[
          { name: 'Home', href: '/' },
          { name: 'Store Locations' }
        ]} 
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Our Locations</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Visit us at any of our stores across Kerala
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map((location) => (
          <div key={location.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">{location.name}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                  <span className="ml-3 dark:text-gray-300">{location.address}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <a href={`tel:${location.phone}`} className="ml-3 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                    {location.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <a href={`mailto:${location.email}`} className="ml-3 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                    {location.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <span className="ml-3 dark:text-gray-300">{location.hours}</span>
                </div>
              </div>

              <button className="mt-6 w-full bg-primary-600 dark:bg-primary-700 text-white py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition">
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-16 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Need Help?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Our customer service team is here to assist you
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="tel:+917594888505"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Us
          </a>
          <a
            href="mailto:support@yarimart.com"
            className="inline-flex items-center px-6 py-3 border border-primary-600 dark:border-primary-500 text-base font-medium rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50"
          >
            <Mail className="w-5 h-5 mr-2" />
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;