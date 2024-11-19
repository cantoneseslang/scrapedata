import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
};

// ボタンコンポーネント
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded focus:outline-none focus:ring transition duration-150 ease-in-out';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      break;
    case 'secondary':
      variantStyles =
        'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-400';
      break;
    case 'outline':
      variantStyles =
        'border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-400';
      break;
    default:
      variantStyles =
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};