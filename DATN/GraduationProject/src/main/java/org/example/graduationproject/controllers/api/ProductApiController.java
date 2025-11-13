package org.example.graduationproject.controllers.api;

import jakarta.validation.Valid;
import org.example.graduationproject.dto.ProductDTO;
import org.example.graduationproject.models.SanPham;
import org.example.graduationproject.services.SanPhamService;
import org.example.graduationproject.services.AdminProductService;
import org.example.graduationproject.repositories.LoaiRepository;
import org.example.graduationproject.repositories.NhanHieuRepository;
import org.example.graduationproject.repositories.NhaCungCapRepository;
import org.example.graduationproject.repositories.SanPhamRepository;
import org.example.graduationproject.repositories.ImageSanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class ProductApiController {

    @Autowired
    private SanPhamService sanPhamService;
    
    @Autowired
    private AdminProductService adminProductService;
    
    @Autowired
    private LoaiRepository loaiRepository;
    
    @Autowired
    private NhanHieuRepository nhanHieuRepository;
    
    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;
    
    @Autowired
    private SanPhamRepository sanPhamRepository;
    
    @Autowired
    private ImageSanPhamRepository imageSanPhamRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer gender) {
        try {
            // Use real data from database with filters
            String genderStr = gender != null ? gender.toString() : null;
            Page<SanPham> productPage = sanPhamService.getProductsWithFilters(
                search, categoryId, genderStr, page, size);
            
            List<ProductDTO> productDTOs = productPage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", productDTOs);
            response.put("currentPage", productPage.getNumber());
            response.put("totalElements", productPage.getTotalElements());
            response.put("totalPages", productPage.getTotalPages());
            response.put("size", productPage.getSize());
            response.put("number", productPage.getNumber());
            response.put("first", productPage.isFirst());
            response.put("last", productPage.isLast());
            response.put("numberOfElements", productPage.getNumberOfElements());
            response.put("empty", productPage.isEmpty());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching products: " + e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Integer id) {
        try {
            return sanPhamService.findById(id)
                    .map(product -> new ResponseEntity<>(convertToDTO(product), HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    

    @GetMapping("/form-data")
    public ResponseEntity<Map<String, Object>> getFormData() {
        try {
            // Load real data from database
            Map<String, Object> formData = new HashMap<>();
            
            // Load categories (loais) - only id and name to avoid circular reference
            var categories = loaiRepository.findAll().stream()
                .map(loai -> Map.of("id", loai.getId(), "ten", loai.getTen()))
                .collect(Collectors.toList());
            formData.put("loais", categories);
            
            // Load brands (nhanHieus) - only id and name to avoid circular reference
            var brands = nhanHieuRepository.findAll().stream()
                .map(nhanHieu -> Map.of("id", nhanHieu.getId(), "ten", nhanHieu.getTen()))
                .collect(Collectors.toList());
            formData.put("nhanHieus", brands);
            
            // Load suppliers (nhaCungCaps) - only id and name to avoid circular reference
            var suppliers = nhaCungCapRepository.findAll().stream()
                .map(nhaCungCap -> Map.of("id", nhaCungCap.getId(), "ten", nhaCungCap.getTen()))
                .collect(Collectors.toList());
            formData.put("nhaCungCaps", suppliers);
            
            return new ResponseEntity<>(formData, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to mock data on error
            Map<String, Object> mockData = new HashMap<>();
            return new ResponseEntity<>(mockData, HttpStatus.OK);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createProduct(
            @Valid @RequestBody ProductDTO productDTO,
            @RequestParam(value = "imageUrls", defaultValue = "") String imageUrls) {
        try {
            var result = adminProductService.createProduct(productDTO, imageUrls);
            if (result.isSuccess()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Product created successfully!");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", result.getMessage());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error creating product: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateProduct(
            @PathVariable Integer id, 
            @Valid @RequestBody ProductDTO productDTO,
            @RequestParam(value = "imageUrls", defaultValue = "") String imageUrls) {
        try {
            productDTO.setId(id);
            var result = adminProductService.updateProduct(productDTO, imageUrls);
            if (result.isSuccess()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Product updated successfully!");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", result.getMessage());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error updating product: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Integer id) {
        try {
            var result = adminProductService.deleteProduct(id);
            if (result.isSuccess()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Product deleted successfully!");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", result.getMessage());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error deleting product: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Map<String, String>> toggleActiveStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> body) {
        try {
            boolean active = body.get("active");
            var result = adminProductService.toggleProductActiveStatus(id, active);
            if (result.isSuccess()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Product status updated successfully!");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", result.getMessage());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error updating product status: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ProductDTO convertToDTO(SanPham product) {
        if (product == null) {
            return null;
        }
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setTen(product.getTen() != null ? product.getTen() : "");
        dto.setMoTa(product.getMoTa() != null ? product.getMoTa() : "");
        dto.setGiaBan(product.getGiaBan());
        dto.setGiaNhap(product.getGiaNhap());
        dto.setKhuyenMai(product.getKhuyenMai());
        dto.setTag(product.getTag() != null ? product.getTag() : "");
        dto.setHuongDan(product.getHuongDan() != null ? product.getHuongDan() : "");
        dto.setThanhPhan(product.getThanhPhan() != null ? product.getThanhPhan() : "");
        dto.setTrangThaiSanPham(product.getTrangThaiSanPham() != null ? product.getTrangThaiSanPham() : "");
        dto.setTrangThaiHoatDong(product.getTrangThaiHoatDong());
        dto.setGioiTinh(product.getGioiTinh());
        
        if (product.getLoai() != null) {
            dto.setLoaiId(product.getLoai().getId());
        }
        if (product.getNhanHieu() != null) {
            dto.setNhanHieuId(product.getNhanHieu().getId());
        }
        if (product.getNhaCungCap() != null) {
            dto.setNhaCungCapId(product.getNhaCungCap().getId());
        }
        
        // Map image fields from related images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            String imageUrls = product.getImages().stream()
                .map(img -> img.getImageName())
                .filter(name -> name != null && !name.isEmpty())
                .collect(Collectors.joining(","));
            dto.setImageUrls(imageUrls);
            // Set first image as hinhAnh
            String firstImage = product.getImages().stream()
                .map(img -> img.getImageName())
                .filter(name -> name != null && !name.isEmpty())
                .findFirst()
                .orElse("");
            dto.setHinhAnh(firstImage);
        } else {
            dto.setImageUrls("");
            dto.setHinhAnh("");
        }
        
        return dto;
    }
}
