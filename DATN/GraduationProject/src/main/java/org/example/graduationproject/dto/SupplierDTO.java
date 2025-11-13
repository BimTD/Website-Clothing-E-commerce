package org.example.graduationproject.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Integer id;

    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 255, message = "Supplier name must be between 2 and 255 characters")
    private String ten;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10-11 digits")
    private String sdt;

    @Size(max = 1000, message = "Information must not exceed 1000 characters")
    private String thongTin;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String diaChi;
}

