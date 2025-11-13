import React from 'react';

const News: React.FC = () => {
  return (
    <div className="bg-white min-h-[60vh] py-16">
      <div className="container">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-5">Tin Tức</h1>
          <p className="text-lg text-gray-600 mb-10">
            Cập nhật những tin tức mới nhất về thời trang và xu hướng
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-strong">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-6xl text-white">📰</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Xu hướng thời trang 2024</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Khám phá những xu hướng thời trang hot nhất trong năm 2024
                </p>
                <span className="text-xs text-gray-500">15/01/2024</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-strong">
              <div className="h-48 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <span className="text-6xl text-white">🎉</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Khuyến mãi đặc biệt</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Giảm giá lên đến 50% cho tất cả sản phẩm mùa hè
                </p>
                <span className="text-xs text-gray-500">10/01/2024</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-strong">
              <div className="h-48 bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
                <span className="text-6xl text-white">🌟</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Bộ sưu tập mới</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Ra mắt bộ sưu tập thời trang cao cấp mới nhất
                </p>
                <span className="text-xs text-gray-500">05/01/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;




