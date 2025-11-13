package org.example.graduationproject.services;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.GioHang;

public interface CartPageService {
    
    /**
     * Lấy thông tin giỏ hàng của user hiện tại
     */
    ServiceResult<GioHang> getCartPageData();
}






