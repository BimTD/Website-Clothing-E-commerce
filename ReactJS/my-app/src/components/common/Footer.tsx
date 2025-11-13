import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-16 mt-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Information */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Thông Tin</h3>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Giới thiệu</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Thông tin giao hàng</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Điều khoản & Điều kiện</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Liên hệ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Trả lại</a></li>
            </ul>
          </div>

          {/* Column 2: Extras */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Extras</h3>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Thương hiệu</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Phiếu quà tặng</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Liên kết</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Đặc biệt</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Sơ đồ trang web</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-500 transition-colors text-sm">Tài khoản của tôi</a></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Liên Hệ</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-gray-800 font-semibold block mb-1">Địa chỉ:</strong>
                <p className="text-gray-600 text-sm">123 Đường ABC, Quận XYZ, TP.HCM</p>
              </div>
              <div>
                <strong className="text-gray-800 font-semibold block mb-1">Số điện thoại:</strong>
                <p className="text-gray-600 text-sm">0982172169</p>
              </div>
              <div>
                <strong className="text-gray-800 font-semibold block mb-1">Email:</strong>
                <p className="text-gray-600 text-sm">tranduybim2906@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Tham Gia Bản Tin Của Chúng Tôi Ngay Bây Giờ</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Đăng ký nhận bản tin để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và cập nhật từ cửa hàng của chúng tôi.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="w-full">
              <div className="flex rounded overflow-hidden border border-gray-300">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn vào đây..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm outline-none"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-black text-white px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
                >
                  ĐẶT MUA!
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
