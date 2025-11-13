package org.example.graduationproject.services;

import org.example.graduationproject.dto.ProductDTO;
import org.example.graduationproject.dto.ServiceResult;

import java.util.Map;

public interface AdminProductService {
    
    /**
     * Lấy dữ liệu cho form tạo/sửa sản phẩm
     */
    ServiceResult<Map<String, Object>> getProductFormData();
    
    /**
     * Lấy dữ liệu cho form sửa sản phẩm
     */
    ServiceResult<Map<String, Object>> getProductEditFormData(Integer productId);
    
    /**
     * Tạo sản phẩm mới
     */
    ServiceResult<Void> createProduct(ProductDTO productDTO, String imageUrls);
    
    /**
     * Cập nhật sản phẩm
     */
    ServiceResult<Void> updateProduct(ProductDTO productDTO, String imageUrls);
    
    /**
     * Xóa ảnh sản phẩm
     */
    ServiceResult<Void> deleteProductImage(Integer imageId);
    
    /**
     * Toggle trạng thái active của sản phẩm
     */
    ServiceResult<Void> toggleProductActiveStatus(Integer productId, boolean active);
    
    /**
     * Xóa sản phẩm
     */
    ServiceResult<Void> deleteProduct(Integer productId);
}













