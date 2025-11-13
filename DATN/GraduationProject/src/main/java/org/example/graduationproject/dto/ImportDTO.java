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
public class ImportDTO {
    private Integer id;
    
    @NotBlank(message = "Số chứng từ không được để trống")
    private String soChungTu;
    
    private LocalDateTime ngayTao;
    
    @NotNull(message = "Tổng tiền không được để trống")
    @DecimalMin(value = "0.0", message = "Tổng tiền phải lớn hơn hoặc bằng 0")
    private BigDecimal tongTien;
    
    @NotBlank(message = "Người lập phiếu không được để trống")
    private String nguoiLapPhieu;
    
    private String ghiChu;
    
    @NotNull(message = "Nhà cung cấp không được để trống")
    private Integer nhaCungCapId;
    private String nhaCungCapTen;
    
    private List<ImportDetailDTO> chiTietPhieuNhaps;
}
