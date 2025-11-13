package org.example.graduationproject.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer id;
    private String ten;
    private String moTa;
    private BigDecimal giaBan;
    private BigDecimal giaNhap;
    private BigDecimal khuyenMai;
    private String tag;
    private String huongDan;
    private String thanhPhan;
    private String trangThaiSanPham;
    private Boolean trangThaiHoatDong;
    private Integer gioiTinh;
    private Integer loaiId;
    private Integer nhanHieuId;
    private Integer nhaCungCapId;
    private String imageUrls;
    private String hinhAnh;
}