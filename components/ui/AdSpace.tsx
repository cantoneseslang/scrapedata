import React from 'react';

interface AdSpaceProps {
  className?: string;
  isTop?: boolean;
}

const AdSpace: React.FC<AdSpaceProps> = ({ className = '', isTop = false }) => {
  return (
    <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      {isTop ? (
        <div className="text-gray-500 text-sm">
          上部広告スペース
        </div>
      ) : (
        <div className="text-gray-500 text-sm">
          広告スペース
        </div>
      )}
    </div>
  );
};

export default AdSpace;