package org.example.graduationproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColorDTO {
    private Integer id;
    
    @NotBlank(message = "Mã màu không được để trống")
    @Size(max = 100, message = "Mã màu không được vượt quá 100 ký tự")
    private String maMau;
    
    @NotNull(message = "Danh mục không được để trống")
    private Integer loaiId;
    
    private String loaiTen; // For display purposes
}
