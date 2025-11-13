package org.example.graduationproject.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailDTO {
    private Integer id;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;
    
    @NotNull(message = "Thành tiền không được để trống")
    @DecimalMin(value = "0.0", message = "Thành tiền phải lớn hơn hoặc bằng 0")
    private BigDecimal thanhTien;
    
    @NotNull(message = "Hóa đơn không được để trống")
    private Integer hoaDonId;
    
    @NotNull(message = "Biến thể sản phẩm không được để trống")
    private Integer sanPhamBienTheId;
    private String sanPhamTen;
    private String variantInfo; // Thông tin biến thể (sản phẩm + màu + size)
    private BigDecimal giaBan; // Giá bán của sản phẩm
}
