package org.example.graduationproject.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Integer id;
    
    @NotNull(message = "Ngày tạo không được để trống")
    private LocalDateTime ngayTao;
    
    private String ghiChu;
    
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;
    
    @NotBlank(message = "Loại thanh toán không được để trống")
    private String loaiThanhToan;
    
    private String daLayTien;
    
    private String diaChiGiaoHang;
    
    private String tenNguoiNhan;
    
    private String soDienThoaiGiaoHang;
    
    @NotNull(message = "Tổng tiền không được để trống")
    @DecimalMin(value = "0.0", message = "Tổng tiền phải lớn hơn hoặc bằng 0")
    private BigDecimal tongTien;
    
    @NotNull(message = "User không được để trống")
    private Integer userId;
    private String userTen;
    private String userEmail;
    
    private List<InvoiceDetailDTO> chiTietHoaDons;
}
