package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.AddToCartDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.dto.UpdateCartItemDTO;
import org.example.graduationproject.exceptions.BadRequestException;
import org.example.graduationproject.exceptions.UnauthorizedException;
import org.example.graduationproject.models.*;
import org.example.graduationproject.repositories.ChiTietGioHangRepository;
import org.example.graduationproject.repositories.GioHangRepository;
import org.example.graduationproject.repositories.SanPhamBienTheRepository;
import org.example.graduationproject.repositories.UserRepository;
import org.example.graduationproject.services.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class GioHangServiceImpl implements GioHangService {

    @Autowired
    private GioHangRepository gioHangRepository;

    @Autowired
    private ChiTietGioHangRepository chiTietGioHangRepository;

    @Autowired
    private SanPhamBienTheRepository sanPhamBienTheRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public GioHang getOrCreateActiveCart(User user) {
        Optional<GioHang> existingCart = gioHangRepository.findByUserAndTrangThai(user, "active");
        
        if (existingCart.isPresent()) {
            return existingCart.get();
        }

        // Tạo giỏ hàng mới
        GioHang newCart = new GioHang();
        newCart.setUser(user);
        newCart.setTrangThai("active");
        newCart.setNgayTao(LocalDateTime.now());
        newCart.setNgayCapNhat(LocalDateTime.now());
        
        return gioHangRepository.save(newCart);
    }

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public ServiceResult<Void> addToCart(AddToCartDTO addToCartDTO) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }
        boolean ok = addToCart(user, addToCartDTO);
        if (!ok) {
            throw new BadRequestException("Không thể thêm sản phẩm vào giỏ hàng");
        }
        return ServiceResult.ok("Đã thêm sản phẩm vào giỏ hàng", null);
    }

    @Override
    public ServiceResult<Void> updateCartItemQuantity(UpdateCartItemDTO updateCartItemDTO) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }
        Integer itemId = updateCartItemDTO.getItemId();
        Integer quantity = updateCartItemDTO.getQuantity();
        if (itemId == null || itemId <= 0) {
            throw new BadRequestException("ID sản phẩm không hợp lệ");
        }
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        boolean ok = updateCartItemQuantity(user, itemId, quantity);
        if (!ok) {
            throw new BadRequestException("Không thể cập nhật số lượng");
        }
        return ServiceResult.ok("Đã cập nhật số lượng", null);
    }

    @Override
    public ServiceResult<Void> removeFromCart(Integer cartItemId) {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }
        if (cartItemId == null || cartItemId <= 0) {
            throw new BadRequestException("ID sản phẩm không hợp lệ");
        }
        boolean ok = removeFromCart(user, cartItemId);
        if (!ok) {
            throw new BadRequestException("Không thể xóa sản phẩm");
        }
        return ServiceResult.ok("Đã xóa sản phẩm khỏi giỏ hàng", null);
    }

    @Override
    public ServiceResult<Integer> getCartItemCount() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            return ServiceResult.ok("Chưa đăng nhập", 0);
        }
        GioHang cart = getActiveCart(user);
        int count = 0;
        if (cart != null && cart.getChiTietGioHangs() != null) {
            count = cart.getChiTietGioHangs().size();
        }
        return ServiceResult.ok("OK", count);
    }

    @Override
    public boolean addToCart(User user, AddToCartDTO addToCartDTO) {
        try {
            // Lấy hoặc tạo giỏ hàng
            GioHang cart = getOrCreateActiveCart(user);
            
            // Tìm biến thể sản phẩm dựa trên size và color
            Optional<SanPhamBienThe> variantOpt = sanPhamBienTheRepository.findById(addToCartDTO.getProductId());
            if (variantOpt.isEmpty()) {
                return false;
            }
            
            SanPhamBienThe variant = variantOpt.get();
            
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            Optional<ChiTietGioHang> existingItem = chiTietGioHangRepository.findByGioHangAndSanPhamBienThe(cart, variant);
            
            if (existingItem.isPresent()) {
                // Cập nhật số lượng
                ChiTietGioHang item = existingItem.get();
                item.setSoLuong(item.getSoLuong() + addToCartDTO.getQuantity());
                item.setThanhTien(item.getGiaBan().multiply(BigDecimal.valueOf(item.getSoLuong())));
                chiTietGioHangRepository.save(item);
            } else {
                // Thêm mới vào giỏ hàng
                ChiTietGioHang newItem = new ChiTietGioHang();
                newItem.setGioHang(cart);
                newItem.setSanPhamBienThe(variant);
                newItem.setSoLuong(addToCartDTO.getQuantity());
                newItem.setGiaBan(variant.getSanPham().getGiaBan());
                newItem.setThanhTien(variant.getSanPham().getGiaBan().multiply(BigDecimal.valueOf(addToCartDTO.getQuantity())));
                chiTietGioHangRepository.save(newItem);
            }
            
            // Cập nhật thời gian giỏ hàng
            cart.setNgayCapNhat(LocalDateTime.now());
            gioHangRepository.save(cart);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean updateCartItemQuantity(User user, Integer cartItemId, Integer quantity) {
        try {
            Optional<ChiTietGioHang> itemOpt = chiTietGioHangRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) {
                return false;
            }
            
            ChiTietGioHang item = itemOpt.get();
            
            // Kiểm tra xem item có thuộc về user này không
            if (!item.getGioHang().getUser().getId().equals(user.getId())) {
                return false;
            }
            
            item.setSoLuong(quantity);
            item.setThanhTien(item.getGiaBan().multiply(BigDecimal.valueOf(quantity)));
            chiTietGioHangRepository.save(item);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean removeFromCart(User user, Integer cartItemId) {
        try {
            Optional<ChiTietGioHang> itemOpt = chiTietGioHangRepository.findById(cartItemId);
            if (itemOpt.isEmpty()) {
                return false;
            }
            
            ChiTietGioHang item = itemOpt.get();
            
            // Kiểm tra xem item có thuộc về user này không
            if (!item.getGioHang().getUser().getId().equals(user.getId())) {
                return false;
            }
            
            chiTietGioHangRepository.delete(item);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public GioHang getActiveCart(User user) {
        return gioHangRepository.findByUserAndTrangThai(user, "active").orElse(null);
    }
    
    @Override
    public boolean updateCartStatus(GioHang gioHang) {
        try {
            gioHangRepository.save(gioHang);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
