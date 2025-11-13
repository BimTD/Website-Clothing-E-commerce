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
public class SizeDTO {
    private Integer id;
    
    @NotBlank(message = "Tên size không được để trống")
    @Size(max = 50, message = "Tên size không được vượt quá 50 ký tự")
    private String tenSize;
    
    @NotNull(message = "Danh mục không được để trống")
    private Integer loaiId;
    
    private String loaiTen; // For display purposes
}
