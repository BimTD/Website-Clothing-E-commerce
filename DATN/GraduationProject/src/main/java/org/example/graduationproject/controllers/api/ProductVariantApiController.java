package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.ProductVariantDTO;
import org.example.graduationproject.models.SanPhamBienThe;
import org.example.graduationproject.models.SanPham;
import org.example.graduationproject.models.MauSac;
import org.example.graduationproject.models.Size;
import org.example.graduationproject.services.SanPhamBienTheService;
import org.example.graduationproject.repositories.SanPhamRepository;
import org.example.graduationproject.repositories.MauSacRepository;
import org.example.graduationproject.repositories.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/variants")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('ADMIN')")
public class ProductVariantApiController {

    @Autowired
    private SanPhamBienTheService sanPhamBienTheService;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private MauSacRepository mauSacRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVariants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<SanPhamBienThe> variantPage;
            
            if (search.trim().isEmpty()) {
                variantPage = sanPhamBienTheService.getAllPagingWithDetails(pageable);
            } else {
                variantPage = sanPhamBienTheService.searchByKeywordPagingWithDetails(search, pageable);
            }
            
            List<ProductVariantDTO> variantDTOs = variantPage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", variantDTOs);
            response.put("totalPages", variantPage.getTotalPages());
            response.put("totalElements", variantPage.getTotalElements());
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải danh sách biến thể: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/form-data")
    public ResponseEntity<Map<String, Object>> getFormData() {
        try {
            List<SanPham> products = sanPhamRepository.findAll();
            List<MauSac> colors = mauSacRepository.findAll();
            List<Size> sizes = sizeRepository.findAll();
            
            List<Map<String, Object>> productList = products.stream()
                    .map(product -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", product.getId());
                        map.put("ten", product.getTen());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> colorList = colors.stream()
                    .map(color -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", color.getId());
                        map.put("ten", color.getMaMau());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> sizeList = sizes.stream()
                    .map(size -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", size.getId());
                        map.put("ten", size.getTenSize());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("sanPhams", productList);
            response.put("mauSacs", colorList);
            response.put("sizes", sizeList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải form data: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVariant(@Valid @RequestBody ProductVariantDTO variantDTO) {
        try {
            // Check if variant already exists
            if (sanPhamBienTheService.existsProductVariant(variantDTO.getSanPhamId(), variantDTO.getMauSacId(), variantDTO.getSizeId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Biến thể sản phẩm đã tồn tại!");
                return ResponseEntity.status(400).body(response);
            }
            
            SanPhamBienThe variant = convertToEntity(variantDTO);
            SanPhamBienThe savedVariant = sanPhamBienTheService.saveSanPhamBienThe(variant);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm biến thể sản phẩm thành công!");
            response.put("data", convertToDTO(savedVariant));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi thêm biến thể sản phẩm: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVariant(@PathVariable Integer id, @Valid @RequestBody ProductVariantDTO variantDTO) {
        try {
            if (!sanPhamBienTheService.getSanPhamBienTheById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Biến thể sản phẩm không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            variantDTO.setId(id);
            SanPhamBienThe variant = convertToEntity(variantDTO);
            SanPhamBienThe savedVariant = sanPhamBienTheService.saveSanPhamBienThe(variant);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật biến thể sản phẩm thành công!");
            response.put("data", convertToDTO(savedVariant));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật biến thể sản phẩm: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVariant(@PathVariable Integer id) {
        try {
            if (!sanPhamBienTheService.getSanPhamBienTheById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Biến thể sản phẩm không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            sanPhamBienTheService.deleteSanPhamBienThe(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa biến thể sản phẩm thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa biến thể sản phẩm: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private ProductVariantDTO convertToDTO(SanPhamBienThe variant) {
        ProductVariantDTO dto = new ProductVariantDTO();
        dto.setId(variant.getId());
        dto.setSoLuongTon(variant.getSoLuongTon());
        
        if (variant.getSanPham() != null) {
            dto.setSanPhamId(variant.getSanPham().getId());
            dto.setSanPhamTen(variant.getSanPham().getTen());
        }
        
        if (variant.getMauSac() != null) {
            dto.setMauSacId(variant.getMauSac().getId());
            dto.setMauSacTen(variant.getMauSac().getMaMau());
        }
        
        if (variant.getSize() != null) {
            dto.setSizeId(variant.getSize().getId());
            dto.setSizeTen(variant.getSize().getTenSize());
        }
        
        return dto;
    }

    private SanPhamBienThe convertToEntity(ProductVariantDTO dto) {
        SanPhamBienThe variant = new SanPhamBienThe();
        variant.setId(dto.getId());
        variant.setSoLuongTon(dto.getSoLuongTon());
        
        if (dto.getSanPhamId() != null) {
            SanPham sanPham = sanPhamRepository.findById(dto.getSanPhamId()).orElse(null);
            variant.setSanPham(sanPham);
        }
        
        if (dto.getMauSacId() != null) {
            MauSac mauSac = mauSacRepository.findById(dto.getMauSacId()).orElse(null);
            variant.setMauSac(mauSac);
        }
        
        if (dto.getSizeId() != null) {
            Size size = sizeRepository.findById(dto.getSizeId()).orElse(null);
            variant.setSize(size);
        }
        
        return variant;
    }
}
