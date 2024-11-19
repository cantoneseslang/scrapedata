import React from 'react';

interface MapProps {
  exchangeRates: any[];
  selectedStore: any | null;
}

export const Map: React.FC<MapProps> = ({ exchangeRates, selectedStore }) => {
  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg">
      {/* Map implementation */}
    </div>
  );
};