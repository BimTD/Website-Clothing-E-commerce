package org.example.graduationproject.controllers.api;

import jakarta.validation.Valid;
import org.example.graduationproject.dto.SupplierDTO;
import org.example.graduationproject.models.NhaCungCap;
import org.example.graduationproject.services.NhaCungCapService;
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
@RequestMapping("/api/admin/suppliers")
@CrossOrigin(origins = "http://localhost:5173")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class SupplierApiController {

    @Autowired
    private NhaCungCapService nhaCungCapService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        try {
            // First, try to get all suppliers without pagination to test database connection
            List<NhaCungCap> allSuppliers = nhaCungCapService.getAllNhaCungCap();
            
            // Create a simple response
            List<SupplierDTO> supplierDTOs = allSuppliers.stream()
                    .map(this::convertToDTO)
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", supplierDTOs);
            response.put("currentPage", page);
            response.put("totalElements", supplierDTOs.size());
            response.put("totalPages", 1);
            response.put("size", size);
            response.put("number", page);
            response.put("first", true);
            response.put("last", true);
            response.put("numberOfElements", supplierDTOs.size());
            response.put("empty", supplierDTOs.isEmpty());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching suppliers: " + e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("stackTrace", e.getStackTrace()[0].toString());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Supplier API is working!");
        response.put("status", "OK");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/create-test-data")
    public ResponseEntity<Map<String, String>> createTestData() {
        try {
            // Create test supplier
            NhaCungCap testSupplier = new NhaCungCap();
            testSupplier.setTen("Nhà cung cấp test");
            testSupplier.setEmail("test@example.com");
            testSupplier.setSdt("0123456789");
            testSupplier.setDiaChi("123 Test Street");
            testSupplier.setThongTin("Thông tin test");
            
            nhaCungCapService.save(testSupplier);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Test data created successfully!");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error creating test data: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Integer id) {
        return nhaCungCapService.findById(id)
                .map(supplier -> new ResponseEntity<>(convertToDTO(supplier), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createSupplier(@Valid @RequestBody SupplierDTO supplierDTO) {
        try {
            NhaCungCap supplier = convertToEntity(supplierDTO);
            nhaCungCapService.save(supplier);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Supplier created successfully!");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error creating supplier: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateSupplier(@PathVariable Integer id, @Valid @RequestBody SupplierDTO supplierDTO) {
        return nhaCungCapService.findById(id)
                .map(supplier -> {
                    supplier.setTen(supplierDTO.getTen());
                    supplier.setEmail(supplierDTO.getEmail());
                    supplier.setSdt(supplierDTO.getSdt());
                    supplier.setThongTin(supplierDTO.getThongTin());
                    supplier.setDiaChi(supplierDTO.getDiaChi());
                    nhaCungCapService.save(supplier);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Supplier updated successfully!");
                    return new ResponseEntity<>(response, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSupplier(@PathVariable Integer id) {
        return nhaCungCapService.findById(id)
                .map(supplier -> {
                    nhaCungCapService.deleteById(id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Supplier deleted successfully!");
                    return new ResponseEntity<>(response, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    private SupplierDTO convertToDTO(NhaCungCap supplier) {
        if (supplier == null) {
            return null;
        }
        return new SupplierDTO(
                supplier.getId(),
                supplier.getTen() != null ? supplier.getTen() : "",
                supplier.getEmail() != null ? supplier.getEmail() : "",
                supplier.getSdt() != null ? supplier.getSdt() : "",
                supplier.getThongTin() != null ? supplier.getThongTin() : "",
                supplier.getDiaChi() != null ? supplier.getDiaChi() : ""
        );
    }

    private NhaCungCap convertToEntity(SupplierDTO supplierDTO) {
        NhaCungCap supplier = new NhaCungCap();
        supplier.setId(supplierDTO.getId());
        supplier.setTen(supplierDTO.getTen());
        supplier.setEmail(supplierDTO.getEmail());
        supplier.setSdt(supplierDTO.getSdt());
        supplier.setThongTin(supplierDTO.getThongTin());
        supplier.setDiaChi(supplierDTO.getDiaChi());
        return supplier;
    }
}
