import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`bg-white shadow rounded-lg ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ 
  children, 
  className = '', 
  ...props 
}: CardProps) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ 
  children, 
  className = '', 
  ...props 
}: CardProps) => (
  <h3 className={`text-lg font-medium ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ 
  children, 
  className = '', 
  ...props 
}: CardProps) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ 
  children, 
  className = '', 
  ...props 
}: CardProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children, 
  className = '', 
  ...props 
}: CardProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);