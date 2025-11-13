package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.ImportDTO;
import org.example.graduationproject.dto.ImportRequestDTO;
import org.example.graduationproject.dto.ImportDetailDTO;
import org.example.graduationproject.models.PhieuNhapHang;
import org.example.graduationproject.models.ChiTietPhieuNhapHang;
import org.example.graduationproject.models.NhaCungCap;
import org.example.graduationproject.models.SanPhamBienThe;
import org.example.graduationproject.services.AdminImportService;
import org.example.graduationproject.repositories.NhaCungCapRepository;
import org.example.graduationproject.repositories.SanPhamBienTheRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/imports")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('ADMIN')")
public class ImportApiController {

    @Autowired
    private AdminImportService adminImportService;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private SanPhamBienTheRepository sanPhamBienTheRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllImports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        try {
            var result = adminImportService.getImportsWithFilters(search, page, size);
            
            if (result.isSuccess()) {
                Map<String, Object> data = result.getData();
                List<PhieuNhapHang> phieuNhapHangs = (List<PhieuNhapHang>) data.get("phieuNhapHangs");
                
                List<ImportDTO> importDTOs = phieuNhapHangs.stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
                
                Map<String, Object> response = new HashMap<>();
                response.put("content", importDTOs);
                response.put("totalPages", data.get("totalPages"));
                response.put("totalElements", data.get("totalElements"));
                response.put("currentPage", page);
                response.put("size", size);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", result.getMessage());
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải danh sách phiếu nhập hàng: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/form-data")
    public ResponseEntity<Map<String, Object>> getFormData() {
        try {
            List<NhaCungCap> suppliers = nhaCungCapRepository.findAll();
            List<SanPhamBienThe> variants = sanPhamBienTheRepository.findAll();
            
            List<Map<String, Object>> supplierList = suppliers.stream()
                    .map(supplier -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", supplier.getId());
                        map.put("ten", supplier.getTen());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> variantList = variants.stream()
                    .map(variant -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", variant.getId());
                        map.put("variantInfo", buildVariantInfo(variant));
                        map.put("productId", variant.getSanPham() != null ? variant.getSanPham().getId() : null);
                        map.put("productTen", variant.getSanPham() != null ? variant.getSanPham().getTen() : "");
                        return map;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("suppliers", supplierList);
            response.put("variants", variantList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải form data: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createImport(@Valid @RequestBody ImportRequestDTO request) {
        try {
            var result = adminImportService.createImport(request);
            
            if (result.isSuccess()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Tạo phiếu nhập hàng thành công!");
                response.put("data", result.getData());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", result.getMessage());
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo phiếu nhập hàng: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getImportDetail(@PathVariable Integer id) {
        try {
            var result = adminImportService.getImportDetail(id);
            
            if (result.isSuccess()) {
                Map<String, Object> data = result.getData();
                PhieuNhapHang phieu = (PhieuNhapHang) data.get("phieu");
                List<ChiTietPhieuNhapHang> details = (List<ChiTietPhieuNhapHang>) data.get("details");
                
                ImportDTO importDTO = convertToDTO(phieu);
                List<ImportDetailDTO> detailDTOs = details.stream()
                        .map(this::convertDetailToDTO)
                        .collect(Collectors.toList());
                importDTO.setChiTietPhieuNhaps(detailDTOs);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", importDTO);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", result.getMessage());
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy chi tiết phiếu nhập hàng: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteImport(@PathVariable Integer id) {
        try {
            var result = adminImportService.deleteImport(id);
            
            if (result.isSuccess()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Xóa phiếu nhập hàng thành công!");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", result.getMessage());
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa phiếu nhập hàng: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private ImportDTO convertToDTO(PhieuNhapHang phieu) {
        ImportDTO dto = new ImportDTO();
        dto.setId(phieu.getId());
        dto.setSoChungTu(phieu.getSoChungTu());
        dto.setNgayTao(phieu.getNgayTao());
        dto.setTongTien(phieu.getTongTien());
        dto.setNguoiLapPhieu(phieu.getNguoiLapPhieu());
        dto.setGhiChu(phieu.getGhiChu());
        
        if (phieu.getNhaCungCap() != null) {
            dto.setNhaCungCapId(phieu.getNhaCungCap().getId());
            dto.setNhaCungCapTen(phieu.getNhaCungCap().getTen());
        }
        
        return dto;
    }

    private ImportDetailDTO convertDetailToDTO(ChiTietPhieuNhapHang chiTiet) {
        ImportDetailDTO dto = new ImportDetailDTO();
        dto.setId(chiTiet.getId());
        dto.setQuantity(chiTiet.getSoLuongNhap());
        dto.setThanhTienNhap(chiTiet.getThanhTienNhap());
        
        if (chiTiet.getSanPhamBienThe() != null) {
            SanPhamBienThe variant = chiTiet.getSanPhamBienThe();
            dto.setVariantId(variant.getId());
            dto.setVariantInfo(buildVariantInfo(variant));
            
            if (variant.getSanPham() != null) {
                dto.setProductId(variant.getSanPham().getId());
                dto.setProductTen(variant.getSanPham().getTen());
            }
        }
        
        return dto;
    }

    private String buildVariantInfo(SanPhamBienThe variant) {
        StringBuilder info = new StringBuilder();
        
        if (variant.getSanPham() != null) {
            info.append(variant.getSanPham().getTen());
        }
        
        if (variant.getMauSac() != null) {
            info.append(" - ").append(variant.getMauSac().getMaMau());
        }
        
        if (variant.getSize() != null) {
            info.append(" - ").append(variant.getSize().getTenSize());
        }
        
        return info.toString();
    }
}
