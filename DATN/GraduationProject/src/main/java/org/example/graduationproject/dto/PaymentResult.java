package org.example.graduationproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResult {
    
    private PaymentStatus status;
    private String message;
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime processedAt;
    private String errorCode;
    private String providerResponse;
    
    public enum PaymentStatus {
        SUCCESS,
        PENDING,
        FAILED,
        CANCELLED,
        PROCESSING
    }
    
    public static PaymentResult success(String transactionId, BigDecimal amount, String paymentMethod) {
        return PaymentResult.builder()
                .status(PaymentStatus.SUCCESS)
                .message("Thanh toán thành công")
                .transactionId(transactionId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    public static PaymentResult pending(String message, String paymentMethod) {
        return PaymentResult.builder()
                .status(PaymentStatus.PENDING)
                .message(message)
                .paymentMethod(paymentMethod)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    public static PaymentResult failed(String message, String errorCode, String paymentMethod) {
        return PaymentResult.builder()
                .status(PaymentStatus.FAILED)
                .message(message)
                .errorCode(errorCode)
                .paymentMethod(paymentMethod)
                .processedAt(LocalDateTime.now())
                .build();
    }
}








