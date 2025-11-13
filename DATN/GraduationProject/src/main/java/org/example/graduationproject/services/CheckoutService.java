package org.example.graduationproject.services;

import org.example.graduationproject.dto.CheckoutDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.GioHang;
import org.example.graduationproject.models.HoaDon;

public interface CheckoutService {
    
    // Service-first APIs handle auth/validate inside service
    ServiceResult<GioHang> getCheckoutCart();
    ServiceResult<HoaDon> processCheckout(CheckoutDTO checkoutDTO);
    
    // Internal use methods
    boolean validateCheckout(GioHang cart);
    boolean isCartEmpty(GioHang cart);
}

