package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.SizeDTO;
import org.example.graduationproject.models.Size;
import org.example.graduationproject.models.Loai;
import org.example.graduationproject.services.SizeService;
import org.example.graduationproject.repositories.LoaiRepository;
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
@RequestMapping("/api/admin/sizes")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('ADMIN')")
public class SizeApiController {

    @Autowired
    private SizeService sizeService;

    @Autowired
    private LoaiRepository loaiRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSizes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Size> sizePage;
            
            if (search.trim().isEmpty()) {
                sizePage = sizeService.findAll(pageable);
            } else {
                sizePage = sizeService.findByTenSizeContainingIgnoreCase(search, pageable);
            }
            
            List<SizeDTO> sizeDTOs = sizePage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", sizeDTOs);
            response.put("totalPages", sizePage.getTotalPages());
            response.put("totalElements", sizePage.getTotalElements());
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải danh sách size: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/form-data")
    public ResponseEntity<Map<String, Object>> getFormData() {
        try {
            List<Loai> categories = loaiRepository.findAll();
            List<Map<String, Object>> categoryList = categories.stream()
                    .map(cat -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", cat.getId());
                        map.put("ten", cat.getTen());
                        return map;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("loais", categoryList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải form data: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSize(@Valid @RequestBody SizeDTO sizeDTO) {
        try {
            Size size = convertToEntity(sizeDTO);
            Size savedSize = sizeService.save(size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm size thành công!");
            response.put("data", convertToDTO(savedSize));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi thêm size: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSize(@PathVariable Integer id, @Valid @RequestBody SizeDTO sizeDTO) {
        try {
            if (!sizeService.findById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Size không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            sizeDTO.setId(id);
            Size size = convertToEntity(sizeDTO);
            Size savedSize = sizeService.save(size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật size thành công!");
            response.put("data", convertToDTO(savedSize));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật size: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSize(@PathVariable Integer id) {
        try {
            if (!sizeService.findById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Size không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            sizeService.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa size thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa size: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private SizeDTO convertToDTO(Size size) {
        SizeDTO dto = new SizeDTO();
        dto.setId(size.getId());
        dto.setTenSize(size.getTenSize());
        if (size.getLoai() != null) {
            dto.setLoaiId(size.getLoai().getId());
            dto.setLoaiTen(size.getLoai().getTen());
        }
        return dto;
    }

    private Size convertToEntity(SizeDTO dto) {
        Size size = new Size();
        size.setId(dto.getId());
        size.setTenSize(dto.getTenSize());
        if (dto.getLoaiId() != null) {
            Loai loai = loaiRepository.findById(dto.getLoaiId()).orElse(null);
            size.setLoai(loai);
        }
        return size;
    }
}
