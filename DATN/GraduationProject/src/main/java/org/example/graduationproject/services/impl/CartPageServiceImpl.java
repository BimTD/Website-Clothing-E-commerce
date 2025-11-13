package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.GioHang;
import org.example.graduationproject.models.User;
import org.example.graduationproject.repositories.UserRepository;
import org.example.graduationproject.services.CartPageService;
import org.example.graduationproject.services.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CartPageServiceImpl implements CartPageService {

    @Autowired
    private GioHangService gioHangService;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public ServiceResult<GioHang> getCartPageData() {
        try {
            // Lấy user hiện tại
            User user = getCurrentUserOrNull();
            if (user == null) {
                return ServiceResult.unauthorized("Vui lòng đăng nhập để xem giỏ hàng");
            }

            // Lấy giỏ hàng của user
            GioHang cart = gioHangService.getActiveCart(user);
            if (cart == null) {
                return ServiceResult.ok("Giỏ hàng trống", new GioHang());
            }

            return ServiceResult.ok("Lấy thông tin giỏ hàng thành công", cart);

        } catch (Exception e) {
            return ServiceResult.serverError("Có lỗi xảy ra khi lấy thông tin giỏ hàng: " + e.getMessage());
        }
    }

    /**
     * Lấy user hiện tại từ SecurityContext
     */
    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
