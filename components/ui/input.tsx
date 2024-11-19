import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

// 入力フィールドコンポーネント
export const Input: React.FC<InputProps> = ({
  className = '',
  ...props
}) => {
  const baseStyles =
    'block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  return <input className={`${baseStyles} ${className}`} {...props} />;
};