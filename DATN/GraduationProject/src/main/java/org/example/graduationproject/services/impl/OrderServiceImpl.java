package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.exceptions.BadRequestException;
import org.example.graduationproject.exceptions.NotFoundException;
import org.example.graduationproject.exceptions.UnauthorizedException;
import org.example.graduationproject.models.HoaDon;
import org.example.graduationproject.models.User;
import org.example.graduationproject.repositories.UserRepository;
import org.example.graduationproject.services.HoaDonService;
import org.example.graduationproject.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private HoaDonService hoaDonService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public ServiceResult<List<HoaDon>> getUserOrders() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }

        List<HoaDon> orders = hoaDonService.getUserOrders(user);
        return ServiceResult.ok("Lấy danh sách đơn hàng thành công", orders);
    }

    @Override
    public ServiceResult<HoaDon> getOrderDetail(Integer orderId) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }

        HoaDon order = hoaDonService.getUserOrderById(user, orderId);
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng");
        }

        return ServiceResult.ok("Lấy chi tiết đơn hàng thành công", order);
    }

    @Override
    public ServiceResult<Void> cancelOrder(Integer orderId) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }

        boolean success = hoaDonService.cancelOrder(user, orderId);
        if (!success) {
            throw new BadRequestException("Không thể hủy đơn hàng này");
        }

        return ServiceResult.ok("Hủy đơn hàng thành công", null);
    }
}
