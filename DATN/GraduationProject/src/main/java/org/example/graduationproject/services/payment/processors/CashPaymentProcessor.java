package org.example.graduationproject.services.payment.processors;

import org.example.graduationproject.dto.PaymentRequest;
import org.example.graduationproject.dto.PaymentResult;
import org.example.graduationproject.enums.PaymentType;
import org.example.graduationproject.services.payment.PaymentProcessor;
import org.springframework.stereotype.Component;

import java.util.UUID;


@Component
public class CashPaymentProcessor implements PaymentProcessor {
    
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        // Validate trước khi xử lý
        if (!validatePayment(request)) {
            return PaymentResult.failed(
                "Thông tin thanh toán không hợp lệ", 
                "INVALID_REQUEST", 
                PaymentType.CASH.getCode()
            );
        }
        
        try {
            // Logic xử lý thanh toán tiền mặt
            // Với tiền mặt, chúng ta chỉ cần tạo pending payment
            String transactionId = generateTransactionId();
            
            // Log payment request
            logPaymentRequest(request, transactionId);
            
            // Trả về kết quả pending - chờ nhận tiền khi giao hàng
            return PaymentResult.pending(
                "Đơn hàng được tạo thành công. Bạn sẽ thanh toán khi nhận hàng.",
                PaymentType.CASH.getCode()
            );
            
        } catch (Exception e) {
            return PaymentResult.failed(
                "Có lỗi xảy ra khi xử lý thanh toán: " + e.getMessage(),
                "PROCESSING_ERROR",
                PaymentType.CASH.getCode()
            );
        }
    }
    
    @Override
    public boolean validatePayment(PaymentRequest request) {
        // Validate basic required fields
        if (request == null) {
            return false;
        }
        
        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return false;
        }
        
        if (request.getOrderId() == null) {
            return false;
        }
        
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            return false;
        }
        
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            return false;
        }
        
        // Với thanh toán tiền mặt, không cần validate thông tin thẻ hay tài khoản
        return true;
    }
    
    @Override
    public String getSupportedPaymentType() {
        return PaymentType.CASH.getCode();
    }
    
    @Override
    public boolean supports(String paymentType) {
        return PaymentType.CASH.getCode().equals(paymentType);
    }

    private String generateTransactionId() {
        return "CASH_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void logPaymentRequest(PaymentRequest request, String transactionId) {
        System.out.println(String.format(
            "[CASH_PAYMENT] TransactionId: %s, OrderId: %d, Amount: %s, Customer: %s",
            transactionId,
            request.getOrderId(),
            request.getAmount(),
            request.getCustomerName()
        ));
    }
}


