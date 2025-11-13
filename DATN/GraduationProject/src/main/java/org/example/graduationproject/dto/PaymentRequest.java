package org.example.graduationproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho payment request
 * Chứa thông tin cần thiết để xử lý thanh toán
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    
    private Integer orderId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private BigDecimal amount;
    private String paymentType;
    private String currency;
    private String description;
}
