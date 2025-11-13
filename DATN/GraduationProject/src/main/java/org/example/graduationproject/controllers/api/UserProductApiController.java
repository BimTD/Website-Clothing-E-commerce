package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.services.SanPhamService;
import org.example.graduationproject.services.UserProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserProductApiController {

    @Autowired
    private SanPhamService sanPhamService;

    @Autowired
    private UserProductService userProductService;

    /**
     * Lấy danh sách sản phẩm cho người dùng với phân trang và lọc
     */
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer gender,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // Convert Integer gender to String for service method
            String genderStr = gender != null ? gender.toString() : null;
            Page<org.example.graduationproject.models.SanPham> productPage = 
                sanPhamService.getProductsWithFilters(search, categoryId, genderStr, page, size);

            // Convert to DTO format for frontend
            Map<String, Object> result = new HashMap<>();
            result.put("content", productPage.getContent().stream().map(this::convertToUserProductDTO).toList());
            result.put("totalPages", productPage.getTotalPages());
            result.put("totalElements", productPage.getTotalElements());
            result.put("currentPage", page);
            result.put("size", size);
            result.put("first", productPage.isFirst());
            result.put("last", productPage.isLast());
            result.put("numberOfElements", productPage.getNumberOfElements());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tải danh sách sản phẩm: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Lấy chi tiết sản phẩm cho người dùng
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> getProductDetail(@PathVariable("id") Integer productId) {
        try {
            ServiceResult<Map<String, Object>> result = userProductService.getProductQuickView(productId);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result.getData());
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", result.getMessage());
                return ResponseEntity.status(result.getStatus()).body(error);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tải chi tiết sản phẩm: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Lấy sản phẩm nổi bật (featured products)
     */
    @GetMapping("/products/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<org.example.graduationproject.models.SanPham> productPage = 
                sanPhamService.getProductsWithFilters("", null, null, page, size);

            Map<String, Object> result = new HashMap<>();
            result.put("content", productPage.getContent().stream().map(this::convertToUserProductDTO).toList());
            result.put("totalPages", productPage.getTotalPages());
            result.put("totalElements", productPage.getTotalElements());
            result.put("currentPage", page);
            result.put("size", size);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tải sản phẩm nổi bật: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Lấy sản phẩm mới nhất
     */
    @GetMapping("/products/new")
    public ResponseEntity<Map<String, Object>> getNewProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<org.example.graduationproject.models.SanPham> productPage = 
                sanPhamService.getProductsWithFilters("", null, null, page, size);

            Map<String, Object> result = new HashMap<>();
            result.put("content", productPage.getContent().stream().map(this::convertToUserProductDTO).toList());
            result.put("totalPages", productPage.getTotalPages());
            result.put("totalElements", productPage.getTotalElements());
            result.put("currentPage", page);
            result.put("size", size);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tải sản phẩm mới: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Lấy sản phẩm theo danh mục
     */
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<Map<String, Object>> getProductsByCategory(
            @PathVariable("categoryId") Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<org.example.graduationproject.models.SanPham> productPage = 
                sanPhamService.getProductsWithFilters("", categoryId, null, page, size);

            Map<String, Object> result = new HashMap<>();
            result.put("content", productPage.getContent().stream().map(this::convertToUserProductDTO).toList());
            result.put("totalPages", productPage.getTotalPages());
            result.put("totalElements", productPage.getTotalElements());
            result.put("currentPage", page);
            result.put("size", size);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi tải sản phẩm theo danh mục: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Convert SanPham entity to user-friendly DTO
     */
    private Map<String, Object> convertToUserProductDTO(org.example.graduationproject.models.SanPham product) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", product.getId());
        dto.put("ten", product.getTen());
        dto.put("giaBan", product.getGiaBan());
        dto.put("khuyenMai", product.getKhuyenMai());
        dto.put("moTa", product.getMoTa());
        dto.put("trangThai", product.getTrangThaiHoatDong());
        dto.put("gioiTinh", product.getGioiTinh());
        
        // Category info
        if (product.getLoai() != null) {
            Map<String, Object> category = new HashMap<>();
            category.put("id", product.getLoai().getId());
            category.put("ten", product.getLoai().getTen());
            dto.put("loai", category);
        }
        
        // Brand info
        if (product.getNhanHieu() != null) {
            Map<String, Object> brand = new HashMap<>();
            brand.put("id", product.getNhanHieu().getId());
            brand.put("ten", product.getNhanHieu().getTen());
            dto.put("nhanHieu", brand);
        }
        
        // Images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            dto.put("hinhAnh", product.getImages().get(0).getImageName());
            dto.put("imageUrls", product.getImages().stream()
                .map(img -> img.getImageName())
                .toArray(String[]::new));
        } else {
            dto.put("hinhAnh", null);
            dto.put("imageUrls", new String[0]);
        }
        
        return dto;
    }
}
