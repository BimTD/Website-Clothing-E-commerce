package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.ColorDTO;
import org.example.graduationproject.models.MauSac;
import org.example.graduationproject.models.Loai;
import org.example.graduationproject.services.MauSacService;
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
@RequestMapping("/api/admin/colors")
@CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('ADMIN')")
public class ColorApiController {

    @Autowired
    private MauSacService mauSacService;

    @Autowired
    private LoaiRepository loaiRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllColors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MauSac> colorPage;
            
            if (search.trim().isEmpty()) {
                colorPage = mauSacService.findAll(pageable);
            } else {
                colorPage = mauSacService.findByMaMauContainingIgnoreCase(search, pageable);
            }
            
            List<ColorDTO> colorDTOs = colorPage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", colorDTOs);
            response.put("totalPages", colorPage.getTotalPages());
            response.put("totalElements", colorPage.getTotalElements());
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi tải danh sách màu sắc: " + e.getMessage());
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
    public ResponseEntity<Map<String, Object>> createColor(@Valid @RequestBody ColorDTO colorDTO) {
        try {
            MauSac color = convertToEntity(colorDTO);
            MauSac savedColor = mauSacService.save(color);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm màu sắc thành công!");
            response.put("data", convertToDTO(savedColor));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi thêm màu sắc: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateColor(@PathVariable Integer id, @Valid @RequestBody ColorDTO colorDTO) {
        try {
            if (!mauSacService.findById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Màu sắc không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            colorDTO.setId(id);
            MauSac color = convertToEntity(colorDTO);
            MauSac savedColor = mauSacService.save(color);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật màu sắc thành công!");
            response.put("data", convertToDTO(savedColor));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật màu sắc: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteColor(@PathVariable Integer id) {
        try {
            if (!mauSacService.findById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Màu sắc không tồn tại!");
                return ResponseEntity.status(404).body(response);
            }
            
            mauSacService.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa màu sắc thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa màu sắc: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private ColorDTO convertToDTO(MauSac color) {
        ColorDTO dto = new ColorDTO();
        dto.setId(color.getId());
        dto.setMaMau(color.getMaMau());
        if (color.getLoai() != null) {
            dto.setLoaiId(color.getLoai().getId());
            dto.setLoaiTen(color.getLoai().getTen());
        }
        return dto;
    }

    private MauSac convertToEntity(ColorDTO dto) {
        MauSac color = new MauSac();
        color.setId(dto.getId());
        color.setMaMau(dto.getMaMau());
        if (dto.getLoaiId() != null) {
            Loai loai = loaiRepository.findById(dto.getLoaiId()).orElse(null);
            color.setLoai(loai);
        }
        return color;
    }
}
