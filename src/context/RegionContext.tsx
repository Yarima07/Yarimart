import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Region, Currency } from '../types/product';

const defaultCurrency: Currency = {
  code: 'INR',
  symbol: '₹',
  rate: 1,
  name: 'Indian Rupee'
};

const defaultRegion: Region = {
  code: 'IN',
  name: 'India',
  currency: defaultCurrency,
  flag: '🇮🇳'
};

const regions: Region[] = [defaultRegion];

interface RegionContextType {
  currentRegion: Region;
  setCurrentRegion: (region: Region) => void;
  regions: Region[];
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

interface RegionProviderProps {
  children: ReactNode;
}

export const RegionProvider: React.FC<RegionProviderProps> = ({ children }) => {
  const [currentRegion] = useState<Region>(defaultRegion);

  const convertPrice = (price: number): number => {
    return price;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <RegionContext.Provider
      value={{
        currentRegion,
        setCurrentRegion: () => {}, // No-op since we only support India
        regions,
        formatPrice,
        convertPrice
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};