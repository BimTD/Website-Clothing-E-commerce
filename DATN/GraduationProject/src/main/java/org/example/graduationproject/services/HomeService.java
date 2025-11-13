package org.example.graduationproject.services;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.Loai;
import org.example.graduationproject.models.SanPham;

import java.util.List;
import java.util.Map;

public interface HomeService {
    
    /**
     * Lấy dữ liệu trang chủ bao gồm sản phẩm theo loại và giới tính
     */
    ServiceResult<Map<String, Object>> getHomePageData();
}






