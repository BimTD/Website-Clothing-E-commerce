package org.example.graduationproject.repositories;

import org.example.graduationproject.models.SanPham;
import org.example.graduationproject.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
    List<SanPham> findByGioiTinh(Integer gioiTinh);
    
    Page<SanPham> findAll(Pageable pageable);
    
    Page<SanPham> findByTenContainingIgnoreCase(String ten, Pageable pageable);
    
    // Filter by category
    Page<SanPham> findByLoai_Id(Integer loaiId, Pageable pageable);
    
    // Filter by gender
    Page<SanPham> findByGioiTinh(Integer gioiTinh, Pageable pageable);
    
    // Filter by category and gender
    Page<SanPham> findByLoai_IdAndGioiTinh(Integer loaiId, Integer gioiTinh, Pageable pageable);
    
    // Search by name and filter by category
    Page<SanPham> findByTenContainingIgnoreCaseAndLoai_Id(String ten, Integer loaiId, Pageable pageable);
    
    // Search by name and filter by gender
    Page<SanPham> findByTenContainingIgnoreCaseAndGioiTinh(String ten, Integer gioiTinh, Pageable pageable);
    
    // Search by name and filter by category and gender
    Page<SanPham> findByTenContainingIgnoreCaseAndLoai_IdAndGioiTinh(String ten, Integer loaiId, Integer gioiTinh, Pageable pageable);

    //constructor expression
    @Query("select new org.example.graduationproject.dto.ProductDTO("
            + " s.id, s.ten, s.moTa, s.giaBan, s.giaNhap, s.khuyenMai, s.tag, s.huongDan, s.thanhPhan,"
            + " s.trangThaiSanPham, s.trangThaiHoatDong, s.gioiTinh,"
            + " s.loai.id, s.nhanHieu.id, s.nhaCungCap.id, '', '')"
            + " from SanPham s where s.id = :id")
    Optional<ProductDTO> findProductDTOById(@Param("id") Integer id);
}
