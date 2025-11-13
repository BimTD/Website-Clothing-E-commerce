package org.example.graduationproject.controllers.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.graduationproject.dto.BrandDTO;
import org.example.graduationproject.models.NhanHieu;
import org.example.graduationproject.services.NhanHieuService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Only ADMIN can access these APIs
public class BrandApiController {

    private final NhanHieuService nhanHieuService;

    // GET all brands with pagination and search
    @GetMapping
    public ResponseEntity<Page<BrandDTO>> getAllBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NhanHieu> nhanHieuPage;

        if (search != null && !search.trim().isEmpty()) {
            nhanHieuPage = nhanHieuService.searchNhanHieuByTenPaging(search, page, size);
        } else {
            nhanHieuPage = nhanHieuService.getAllNhanHieuPaging(page, size);
        }

        Page<BrandDTO> dtoPage = nhanHieuPage.map(this::convertToDto);
        return ResponseEntity.ok(dtoPage);
    }

    // GET brand by ID
    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Integer id) {
        Optional<NhanHieu> nhanHieu = nhanHieuService.findById(id);
        return nhanHieu.map(value -> ResponseEntity.ok(convertToDto(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST create new brand
    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandDTO brandDTO) {
        NhanHieu nhanHieu = convertToEntity(brandDTO);
        NhanHieu savedNhanHieu = nhanHieuService.save(nhanHieu);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedNhanHieu));
    }

    // PUT update existing brand
    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable Integer id, @Valid @RequestBody BrandDTO brandDTO) {
        return nhanHieuService.findById(id).map(existingNhanHieu -> {
            existingNhanHieu.setTen(brandDTO.getTen());
            NhanHieu updatedNhanHieu = nhanHieuService.save(existingNhanHieu);
            return ResponseEntity.ok(convertToDto(updatedNhanHieu));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE brand
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Integer id) {
        if (nhanHieuService.findById(id).isPresent()) {
            nhanHieuService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private BrandDTO convertToDto(NhanHieu nhanHieu) {
        return new BrandDTO(nhanHieu.getId(), nhanHieu.getTen());
    }

    private NhanHieu convertToEntity(BrandDTO brandDTO) {
        NhanHieu nhanHieu = new NhanHieu();
        nhanHieu.setId(brandDTO.getId()); // ID might be null for new entities
        nhanHieu.setTen(brandDTO.getTen());
        return nhanHieu;
    }
}



