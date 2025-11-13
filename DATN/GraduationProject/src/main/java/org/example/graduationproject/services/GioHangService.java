package org.example.graduationproject.services;

import org.example.graduationproject.dto.AddToCartDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.dto.UpdateCartItemDTO;
import org.example.graduationproject.models.GioHang;
import org.example.graduationproject.models.User;

public interface GioHangService {
    GioHang getOrCreateActiveCart(User user);

    // New service-first APIs handle auth/validate inside service
    ServiceResult<Void> addToCart(AddToCartDTO addToCartDTO);
    ServiceResult<Void> updateCartItemQuantity(UpdateCartItemDTO updateCartItemDTO);
    ServiceResult<Void> removeFromCart(Integer cartItemId);
    ServiceResult<Integer> getCartItemCount();

    // Existing APIs still available for internal use
    boolean addToCart(User user, AddToCartDTO addToCartDTO);
    boolean updateCartItemQuantity(User user, Integer cartItemId, Integer quantity);
    boolean removeFromCart(User user, Integer cartItemId);
    GioHang getActiveCart(User user);
    boolean updateCartStatus(GioHang gioHang);
}
