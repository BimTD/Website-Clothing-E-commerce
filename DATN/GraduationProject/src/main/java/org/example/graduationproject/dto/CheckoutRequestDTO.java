package org.example.graduationproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDTO {
    
    private String ghiChu;
    private String loaiThanhToan;
    private String diaChiGiaoHang;
    private String soDienThoai;
    private String tenNguoiNhan;
    private BigDecimal phiGiaoHang;
    private BigDecimal tongTien;
    
    // Danh sách sản phẩm từ giỏ hàng frontend
    private List<CartItemDTO> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDTO {
        private Integer productId;
        private String productName;
        private String productImage;
        private String size;
        private String color;
        private BigDecimal price;
        private Integer quantity;
    }
}




