package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.CategoryDTO;
import org.example.graduationproject.models.Loai;
import org.example.graduationproject.services.LoaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class CategoryApiController {

    @Autowired
    private LoaiService loaiService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        Page<Loai> categoryPage;
        if (search != null && !search.trim().isEmpty()) {
            categoryPage = loaiService.searchLoaiByTenPaging(search, page, size);
        } else {
            categoryPage = loaiService.getAllLoaiPaging(page, size);
        }

        List<CategoryDTO> categories = categoryPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("categories", categories);
        response.put("currentPage", categoryPage.getNumber());
        response.put("totalPages", categoryPage.getTotalPages());
        response.put("totalElements", categoryPage.getTotalElements());
        response.put("size", categoryPage.getSize());
        response.put("hasNext", categoryPage.hasNext());
        response.put("hasPrevious", categoryPage.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Integer id) {
        return loaiService.getLoaiById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody CategoryDTO categoryDTO) {
        try {
            Loai loai = convertToEntity(categoryDTO);
            Loai savedLoai = loaiService.saveLoai(loai);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category created successfully");
            response.put("category", convertToDTO(savedLoai));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @PathVariable Integer id, 
            @RequestBody CategoryDTO categoryDTO) {
        try {
            if (!loaiService.getLoaiById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Category not found");
                return ResponseEntity.notFound().build();
            }

            categoryDTO.setId(id);
            Loai loai = convertToEntity(categoryDTO);
            Loai savedLoai = loaiService.saveLoai(loai);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category updated successfully");
            response.put("category", convertToDTO(savedLoai));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable Integer id) {
        try {
            if (!loaiService.getLoaiById(id).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Category not found");
                return ResponseEntity.notFound().build();
            }

            loaiService.deleteLoai(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting category: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private CategoryDTO convertToDTO(Loai loai) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(loai.getId());
        dto.setTen(loai.getTen());
        return dto;
    }

    private Loai convertToEntity(CategoryDTO dto) {
        Loai loai = new Loai();
        if (dto.getId() != null) {
            loai.setId(dto.getId());
        }
        loai.setTen(dto.getTen());
        return loai;
    }
}





