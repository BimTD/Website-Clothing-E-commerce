import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;



