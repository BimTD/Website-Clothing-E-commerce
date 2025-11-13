package org.example.graduationproject.builders;

import org.example.graduationproject.dto.ProductDTO;
import org.example.graduationproject.models.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Builder pattern để tạo SanPham objects
 * Giúp code dễ đọc, dễ maintain và tránh lỗi thứ tự parameters
 */
@Component
public class SanPhamBuilder {
    
    private SanPham sanPham;
    
    public SanPhamBuilder() {
        this.sanPham = new SanPham();
    }
    
    /**
     * Tạo builder mới
     */
    public static SanPhamBuilder newBuilder() {
        return new SanPhamBuilder();
    }
    
    /**
     * Set thông tin cơ bản
     */
    public SanPhamBuilder withBasicInfo(String ten, String moTa) {
        sanPham.setTen(ten);
        sanPham.setMoTa(moTa);
        return this;
    }
    
    /**
     * Set giá cả
     */
    public SanPhamBuilder withPricing(BigDecimal giaBan, BigDecimal giaNhap, BigDecimal khuyenMai) {
        sanPham.setGiaBan(giaBan);
        sanPham.setGiaNhap(giaNhap);
        sanPham.setKhuyenMai(khuyenMai);
        return this;
    }
    
    /**
     * Set thông tin chi tiết
     */
    public SanPhamBuilder withDetails(String tag, String huongDan, String thanhPhan) {
        sanPham.setTag(tag);
        sanPham.setHuongDan(huongDan);
        sanPham.setThanhPhan(thanhPhan);
        return this;
    }
    
    /**
     * Set trạng thái
     */
    public SanPhamBuilder withStatus(String trangThaiSanPham, Boolean trangThaiHoatDong) {
        sanPham.setTrangThaiSanPham(trangThaiSanPham);
        sanPham.setTrangThaiHoatDong(trangThaiHoatDong);
        return this;
    }
    
    /**
     * Set thông tin phân loại
     */
    public SanPhamBuilder withClassification(Integer gioiTinh, Loai loai, NhanHieu nhanHieu, NhaCungCap nhaCungCap) {
        sanPham.setGioiTinh(gioiTinh);
        sanPham.setLoai(loai);
        sanPham.setNhanHieu(nhanHieu);
        sanPham.setNhaCungCap(nhaCungCap);
        return this;
    }
    
    /**
     * Set timestamps
     */
    public SanPhamBuilder withTimestamps() {
        LocalDateTime now = LocalDateTime.now();
        sanPham.setNgayTao(now);
        sanPham.setNgayCapNhat(now);
        return this;
    }
    
    /**
     * Set timestamps với custom values
     */
    public SanPhamBuilder withTimestamps(LocalDateTime ngayTao, LocalDateTime ngayCapNhat) {
        sanPham.setNgayTao(ngayTao);
        sanPham.setNgayCapNhat(ngayCapNhat);
        return this;
    }
    
    /**
     * Build từ ProductDTO
     */
    public SanPhamBuilder fromProductDTO(ProductDTO productDTO, Loai loai, NhanHieu nhanHieu, NhaCungCap nhaCungCap) {
        return this
            .withBasicInfo(productDTO.getTen(), productDTO.getMoTa())
            .withPricing(productDTO.getGiaBan(), productDTO.getGiaNhap(), productDTO.getKhuyenMai())
            .withDetails(productDTO.getTag(), productDTO.getHuongDan(), productDTO.getThanhPhan())
            .withStatus("new", true)
            .withClassification(productDTO.getGioiTinh(), loai, nhanHieu, nhaCungCap)
            .withTimestamps();
    }
    
    /**
     * Build SanPham object
     */
    public SanPham build() {
        // Validation
        if (sanPham.getTen() == null || sanPham.getTen().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        
        if (sanPham.getGiaBan() == null || sanPham.getGiaBan().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá bán phải lớn hơn 0");
        }
        
        if (sanPham.getLoai() == null) {
            throw new IllegalArgumentException("Loại sản phẩm không được để trống");
        }
        
        if (sanPham.getNhanHieu() == null) {
            throw new IllegalArgumentException("Nhãn hiệu không được để trống");
        }
        
        if (sanPham.getNhaCungCap() == null) {
            throw new IllegalArgumentException("Nhà cung cấp không được để trống");
        }
        
        return sanPham;
    }
    
    /**
     * Reset builder để tạo object mới
     */
    public SanPhamBuilder reset() {
        this.sanPham = new SanPham();
        return this;
    }
}











