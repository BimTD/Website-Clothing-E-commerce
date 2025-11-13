package org.example.graduationproject.services;

import org.example.graduationproject.dto.ServiceResult;

import java.util.Map;

public interface UserProductService {
    
    /**
     * Lấy thông tin quick view của sản phẩm
     */
    ServiceResult<Map<String, Object>> getProductQuickView(Integer productId);
}






