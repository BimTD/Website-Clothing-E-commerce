package org.example.graduationproject.services.impl;

import org.example.graduationproject.models.*;
import org.example.graduationproject.dto.ProductDTO;
import org.example.graduationproject.repositories.SanPhamRepository;
import org.example.graduationproject.repositories.LoaiRepository;
import org.example.graduationproject.repositories.NhanHieuRepository;
import org.example.graduationproject.repositories.NhaCungCapRepository;
import org.example.graduationproject.repositories.ImageSanPhamRepository;
import org.example.graduationproject.services.SanPhamService;
import org.example.graduationproject.builders.SanPhamBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Join;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class SanPhamServiceImpl implements SanPhamService {

    @Autowired
    private SanPhamRepository sanPhamRepository;
    @Autowired
    private ImageSanPhamRepository imageSanPhamRepository;
    @Autowired
    private LoaiRepository loaiRepository;
    @Autowired
    private NhanHieuRepository nhanHieuRepository;
    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SanPham> getAll() {
        return this.sanPhamRepository.findAll();
    }

    @Override
    public List<SanPham> getByGioiTinh(Integer gioiTinh) {
        return this.sanPhamRepository.findByGioiTinh(gioiTinh);
    }

    @Override
    public Boolean create(SanPham sanPham) {
        try{
            this.sanPhamRepository.save(sanPham);
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public Optional<SanPham> findById(Integer id) {
        return this.sanPhamRepository.findById(id);
    }

    @Override
    public Boolean deleteById(Integer id) {
        try {
            // Xóa toàn bộ ảnh liên quan trước
            imageSanPhamRepository.deleteAll(imageSanPhamRepository.findAllBySanPham_Id(id));
            this.sanPhamRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Boolean update(SanPham sanPham) {
        try {
            this.sanPhamRepository.save(sanPham);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public SanPham save(SanPham sanPham) {
        return this.sanPhamRepository.save(sanPham);
    }

    @Override
    public void updateActiveStatus(Integer id, boolean active) {
        SanPham sp = sanPhamRepository.findById(id).orElse(null);
        if (sp != null) {
            sp.setTrangThaiHoatDong(active);
            sanPhamRepository.save(sp);
        }
    }

    @Override
    public void saveProductWithUrls(ProductDTO productDTO, String imageUrls) throws Exception {
        // Sử dụng Builder pattern để tạo SanPham
        SanPham sanPham = SanPhamBuilder.newBuilder()
            .fromProductDTO(
                productDTO,
                loaiRepository.findById(productDTO.getLoaiId()).orElse(null),
                nhanHieuRepository.findById(productDTO.getNhanHieuId()).orElse(null),
                nhaCungCapRepository.findById(productDTO.getNhaCungCapId()).orElse(null)
            )
            .build();
        
        sanPham = sanPhamRepository.save(sanPham);
        
        // Xử lý images
        if (imageUrls != null && !imageUrls.isEmpty()) {
            String[] urls = imageUrls.split(",");
            for (String url : urls) {
                ImageSanPham image = new ImageSanPham();
                image.setImageName(url.trim());
                image.setSanPham(sanPham);
                imageSanPhamRepository.save(image);
            }
        }
    }

    @Override
    public void updateProductWithUrls(ProductDTO productDTO, String imageUrls) throws Exception {
        SanPham existingSanPham = sanPhamRepository.findById(productDTO.getId()).orElse(null);
        if (existingSanPham == null) {
            throw new Exception("Product not found with id: " + productDTO.getId());
        }
        
        // Sử dụng Builder pattern để cập nhật SanPham
        SanPham updatedSanPham = SanPhamBuilder.newBuilder()
            .withBasicInfo(productDTO.getTen(), productDTO.getMoTa())
            .withPricing(productDTO.getGiaBan(), productDTO.getGiaNhap(), productDTO.getKhuyenMai())
            .withDetails(productDTO.getTag(), productDTO.getHuongDan(), productDTO.getThanhPhan())
            .withStatus(existingSanPham.getTrangThaiSanPham(), existingSanPham.getTrangThaiHoatDong())
            .withClassification(
                productDTO.getGioiTinh(),
                loaiRepository.findById(productDTO.getLoaiId()).orElse(null),
                nhanHieuRepository.findById(productDTO.getNhanHieuId()).orElse(null),
                nhaCungCapRepository.findById(productDTO.getNhaCungCapId()).orElse(null)
            )
            .withTimestamps(existingSanPham.getNgayTao(), java.time.LocalDateTime.now())
            .build();
        
        // Giữ nguyên ID để update
        updatedSanPham.setId(existingSanPham.getId());
        SanPham savedSanPham = sanPhamRepository.save(updatedSanPham);
        
        // Chỉ xử lý ảnh nếu có imageUrls được cung cấp
        if (imageUrls != null && !imageUrls.trim().isEmpty()) {
            // Xóa tất cả ảnh cũ
            imageSanPhamRepository.deleteAll(imageSanPhamRepository.findAllBySanPham_Id(savedSanPham.getId()));
            
            // Thêm ảnh mới
            String[] urls = imageUrls.split(",");
            for (String url : urls) {
                if (!url.trim().isEmpty()) {
                    ImageSanPham image = new ImageSanPham();
                    image.setImageName(url.trim());
                    image.setSanPham(savedSanPham);
                    imageSanPhamRepository.save(image);
                }
            }
        }
    }
    
    // Phân trang
    @Override
    public Page<SanPham> getAllPaging(int page, int size) {
        return sanPhamRepository.findAll(PageRequest.of(page, size));

    }
    
    @Override
    public Page<SanPham> searchByTenPaging(String ten, int page, int size) {
        return sanPhamRepository.findByTenContainingIgnoreCase(ten, PageRequest.of(page, size));
    }
    
    // Filter methods
    @Override
    public Page<SanPham> filterByCategoryPaging(Integer categoryId, int page, int size) {
        return sanPhamRepository.findByLoai_Id(categoryId, PageRequest.of(page, size));
    }
    
    @Override
    public Page<SanPham> filterByGenderPaging(Integer gender, int page, int size) {
        return sanPhamRepository.findByGioiTinh(gender, PageRequest.of(page, size));
    }
    
    @Override
    public Page<SanPham> filterByCategoryAndGenderPaging(Integer categoryId, Integer gender, int page, int size) {
        return sanPhamRepository.findByLoai_IdAndGioiTinh(categoryId, gender, PageRequest.of(page, size));
    }
    
    // Search with filters
    @Override
    public Page<SanPham> searchByTenAndCategoryPaging(String ten, Integer categoryId, int page, int size) {
        return sanPhamRepository.findByTenContainingIgnoreCaseAndLoai_Id(ten, categoryId, PageRequest.of(page, size));
    }
    
    @Override
    public Page<SanPham> searchByTenAndGenderPaging(String ten, Integer gender, int page, int size) {
        return sanPhamRepository.findByTenContainingIgnoreCaseAndGioiTinh(ten, gender, PageRequest.of(page, size));
    }
    
    @Override
    public Page<SanPham> searchByTenAndCategoryAndGenderPaging(String ten, Integer categoryId, Integer gender, int page, int size) {
        return sanPhamRepository.findByTenContainingIgnoreCaseAndLoai_IdAndGioiTinh(ten, categoryId, gender, PageRequest.of(page, size));
    }
    
    @Override
    public Page<SanPham> getProductsWithFilters(String search, Integer categoryId, String gender, int page, int size) {
        // Sử dụng JPA Criteria API để tạo dynamic query
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SanPham> query = cb.createQuery(SanPham.class);
        Root<SanPham> root = query.from(SanPham.class);
        
        // Tạo danh sách các điều kiện (predicates) sử dụng helper method
        List<Predicate> predicates = createPredicates(cb, root, search, categoryId, gender);
        
        // Kết hợp tất cả điều kiện bằng AND
        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }
        
        // Sắp xếp theo tên sản phẩm
        query.orderBy(cb.asc(root.get("ten")));
        
        // Thực hiện truy vấn để đếm tổng số bản ghi
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<SanPham> countRoot = countQuery.from(SanPham.class);
        
        // Sử dụng helper method để tạo predicates cho count query
        List<Predicate> countPredicates = createPredicates(cb, countRoot, search, categoryId, gender);
        
        if (!countPredicates.isEmpty()) {
            countQuery.where(countPredicates.toArray(new Predicate[0]));
        }
        countQuery.select(cb.count(countRoot));
        
        // Thực hiện count query
        Long totalElements = entityManager.createQuery(countQuery).getSingleResult();
        
        // Thực hiện query chính với phân trang
        TypedQuery<SanPham> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(page * size);
        typedQuery.setMaxResults(size);
        
        List<SanPham> content = typedQuery.getResultList();
        
        // Tạo Page object
        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(content, pageable, totalElements);
    }

    private List<Predicate> createPredicates(CriteriaBuilder cb, Root<SanPham> root, 
                                           String search, Integer categoryId, String gender) {
        List<Predicate> predicates = new ArrayList<>();
        
        // 1. Điều kiện tìm kiếm theo tên sản phẩm và mô tả
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.trim().toLowerCase() + "%";
            predicates.add(cb.or(
                cb.like(cb.lower(root.get("ten")), searchTerm),
                cb.like(cb.lower(root.get("moTa")), searchTerm)
            ));
        }
        
        // 2. Điều kiện lọc theo danh mục (category)
        if (categoryId != null) {
            Join<SanPham, Loai> loaiJoin = root.join("loai");
            predicates.add(cb.equal(loaiJoin.get("id"), categoryId));
        }
        
        // 3. Điều kiện lọc theo giới tính
        if (gender != null && !gender.trim().isEmpty()) {
            try {
                Integer genderValue = Integer.parseInt(gender);
                predicates.add(cb.equal(root.get("gioiTinh"), genderValue));
            } catch (NumberFormatException e) {
                // Bỏ qua nếu gender không phải số
            }
        }
        
        // 4. Điều kiện chỉ hiển thị sản phẩm đang hoạt động
        predicates.add(cb.equal(root.get("trangThaiHoatDong"), true));
        
        return predicates;
    }

    
    @Override
    public Optional<ProductDTO> getProductDTOById(Integer id) {
        return sanPhamRepository.findProductDTOById(id);
    }
    
    @Override
    public void deleteProductById(Integer id) {
        SanPham sanPham = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No products found!"));
        deleteById(id);
    }
    
    @Override
    public void deleteImageById(Integer imageId) {
        imageSanPhamRepository.deleteById(imageId);
    }
    
    @Override
    public String getImageUrlById(Integer imageId) {
        return imageSanPhamRepository.findById(imageId)
            .map(image -> image.getImageName())
            .orElse(null);
    }
    
    @Override
    public void toggleProductActiveStatus(Integer id, boolean active) {
        SanPham sanPham = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No products found!"));
        sanPham.setTrangThaiHoatDong(active);
        sanPhamRepository.save(sanPham);
    }
}
