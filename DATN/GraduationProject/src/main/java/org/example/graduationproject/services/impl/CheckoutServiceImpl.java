package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.CheckoutDTO;
import org.example.graduationproject.dto.PaymentRequest;
import org.example.graduationproject.dto.PaymentResult;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.exceptions.BadRequestException;
import org.example.graduationproject.exceptions.UnauthorizedException;
import org.example.graduationproject.models.GioHang;
import org.example.graduationproject.models.HoaDon;
import org.example.graduationproject.models.User;
import org.example.graduationproject.repositories.UserRepository;
import org.example.graduationproject.services.CheckoutService;
import org.example.graduationproject.services.GioHangService;
import org.example.graduationproject.services.HoaDonService;
import org.example.graduationproject.services.payment.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    @Autowired
    private GioHangService gioHangService;
    
    @Autowired
    private HoaDonService hoaDonService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PaymentService paymentService;

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public ServiceResult<GioHang> getCheckoutCart() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }

        GioHang cart = gioHangService.getActiveCart(user);
        if (cart == null) {
            throw new BadRequestException("Không tìm thấy giỏ hàng");
        }

        if (isCartEmpty(cart)) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        if (!validateCheckout(cart)) {
            throw new BadRequestException("Giỏ hàng không hợp lệ để thanh toán");
        }

        return ServiceResult.ok("Lấy thông tin giỏ hàng thành công", cart);
    }

    @Override
    public ServiceResult<HoaDon> processCheckout(CheckoutDTO checkoutDTO) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }

        // Validate checkout data
        if (checkoutDTO == null) {
            throw new BadRequestException("Thông tin thanh toán không hợp lệ");
        }

        if (checkoutDTO.getTenNguoiNhan() == null || checkoutDTO.getTenNguoiNhan().trim().isEmpty()) {
            throw new BadRequestException("Vui lòng nhập tên người nhận");
        }

        if (checkoutDTO.getSoDienThoai() == null || checkoutDTO.getSoDienThoai().trim().isEmpty()) {
            throw new BadRequestException("Vui lòng nhập số điện thoại");
        }

        if (checkoutDTO.getDiaChiGiaoHang() == null || checkoutDTO.getDiaChiGiaoHang().trim().isEmpty()) {
            throw new BadRequestException("Vui lòng nhập địa chỉ giao hàng");
        }

        // Get and validate cart
        GioHang cart = gioHangService.getActiveCart(user);
        if (cart == null || isCartEmpty(cart)) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        if (!validateCheckout(cart)) {
            throw new BadRequestException("Giỏ hàng không hợp lệ để thanh toán");
        }

        try {
            // Validate payment method trước
            String paymentType = checkoutDTO.getLoaiThanhToan();
            if (paymentType == null || paymentType.trim().isEmpty()) {
                throw new BadRequestException("Vui lòng chọn phương thức thanh toán");
            }
            
            // Create order from cart
            HoaDon hoaDon = hoaDonService.createOrderFromCart(user, checkoutDTO);
            
            if (hoaDon == null) {
                throw new BadRequestException("Không thể tạo đơn hàng");
            }

            // Process payment using Factory pattern
            PaymentResult paymentResult = processPaymentWithFactory(user, hoaDon, checkoutDTO);
            
            // Kiểm tra kết quả thanh toán
            if (paymentResult.getStatus() == PaymentResult.PaymentStatus.FAILED) {
                // Nếu thanh toán thất bại, có thể cần rollback order (tùy business logic)
                throw new BadRequestException("Thanh toán thất bại: " + paymentResult.getMessage());
            }

            return ServiceResult.ok(
                paymentResult.getMessage() + " Mã đơn hàng: " + hoaDon.getId(), 
                hoaDon
            );
            
        } catch (Exception e) {
            throw new BadRequestException("Có lỗi xảy ra khi xử lý đơn hàng: " + e.getMessage());
        }
    }

    @Override
    public boolean validateCheckout(GioHang cart) {
        if (cart == null) {
            return false;
        }
        
        if (cart.getChiTietGioHangs() == null || cart.getChiTietGioHangs().isEmpty()) {
            return false;
        }
        
        // Validate all cart items have valid products and quantities
        return cart.getChiTietGioHangs().stream().allMatch(item -> 
            item.getSanPhamBienThe() != null && 
            item.getSoLuong() != null && 
            item.getSoLuong() > 0 &&
            item.getGiaBan() != null &&
            item.getThanhTien() != null
        );
    }

    @Override
    public boolean isCartEmpty(GioHang cart) {
        return cart == null || 
               cart.getChiTietGioHangs() == null || 
               cart.getChiTietGioHangs().isEmpty();
    }
    
    /**
     * Xử lý thanh toán sử dụng Factory pattern
     */
    private PaymentResult processPaymentWithFactory(User user, HoaDon hoaDon, CheckoutDTO checkoutDTO) {
        // Tạo PaymentRequest từ thông tin checkout
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .paymentType(checkoutDTO.getLoaiThanhToan())
                .amount(hoaDon.getTongTien())
                .currency("VND")
                .orderId(hoaDon.getId())
                .customerName(checkoutDTO.getTenNguoiNhan())
                .customerPhone(checkoutDTO.getSoDienThoai())
                .customerEmail(user.getEmail())
                .description("Thanh toán đơn hàng #" + hoaDon.getId())
                .build();
        
        // Gọi PaymentService để xử lý thanh toán
        return paymentService.processPayment(paymentRequest);
    }
}

