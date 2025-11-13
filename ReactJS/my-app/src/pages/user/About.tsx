import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-[60vh] py-16">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-5">Giới Thiệu</h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Reid Store - Thương hiệu thời trang hàng đầu với cam kết mang đến những sản phẩm chất lượng cao và phong cách độc đáo
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Về Chúng Tôi</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Reid Store được thành lập với sứ mệnh mang đến những sản phẩm thời trang chất lượng cao, 
                  phù hợp với mọi lứa tuổi và phong cách sống.
                </p>
                <p>
                  Chúng tôi cam kết sử dụng những nguyên liệu tốt nhất và quy trình sản xuất hiện đại 
                  để tạo ra những sản phẩm bền đẹp và thân thiện với môi trường.
                </p>
                <p>
                  Với đội ngũ thiết kế tài năng và kinh nghiệm, chúng tôi luôn cập nhật những xu hướng 
                  thời trang mới nhất để mang đến cho khách hàng những trải nghiệm mua sắm tuyệt vời.
                </p>
              </div>
            </div>
            
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Giá Trị Cốt Lõi</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Chất Lượng</h3>
                    <p className="text-gray-600 text-sm">Cam kết mang đến sản phẩm chất lượng cao nhất</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Bền Vững</h3>
                    <p className="text-gray-600 text-sm">Thân thiện với môi trường và phát triển bền vững</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💝</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Khách Hàng</h3>
                    <p className="text-gray-600 text-sm">Đặt khách hàng làm trung tâm trong mọi hoạt động</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;




