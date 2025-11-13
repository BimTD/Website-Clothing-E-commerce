package org.example.graduationproject.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDTO {
    private Integer id;
    
    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer soLuongTon;
    
    @NotNull(message = "Sản phẩm không được để trống")
    private Integer sanPhamId;
    private String sanPhamTen;
    
    @NotNull(message = "Màu sắc không được để trống")
    private Integer mauSacId;
    private String mauSacTen;
    
    @NotNull(message = "Kích cỡ không được để trống")
    private Integer sizeId;
    private String sizeTen;
} 