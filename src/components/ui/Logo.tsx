import React from 'react';
import { Clock } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-primary-200 text-primary-800 p-1 rounded">
        <Clock size={24} strokeWidth={2} />
      </div>
      <span className="ml-2 text-lg font-bold text-white">TimePaySystem</span>
    </div>
  );
};

export default Logo;