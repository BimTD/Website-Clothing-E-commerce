package org.example.graduationproject.services.payment;

import org.example.graduationproject.dto.PaymentRequest;
import org.example.graduationproject.dto.PaymentResult;
import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.enums.PaymentType;
import org.example.graduationproject.services.payment.factory.PaymentProviderFactory;
import org.example.graduationproject.services.notification.NotificationManager;
import org.example.graduationproject.enums.NotificationType;
import org.example.graduationproject.utils.LoggerManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    
    private final List<PaymentProviderFactory> paymentProviderFactories;
    private final LoggerManager loggerManager;
    private final NotificationManager notificationManager;
    

    @Autowired
    public PaymentService(List<PaymentProviderFactory> paymentProviderFactories, 
                         NotificationManager notificationManager) {
        this.paymentProviderFactories = paymentProviderFactories;
        this.loggerManager = LoggerManager.getInstance();
        this.notificationManager = notificationManager;
    }
    
    /**
     * Xử lý thanh toán - main method
     * @param request thông tin thanh toán
     * @return kết quả thanh toán
     */
    public PaymentResult processPayment(PaymentRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Log bắt đầu thanh toán
            loggerManager.logPayment(request.getPaymentType(), 
                                   request.getAmount().toString(), "STARTED");
            
            loggerManager.logBusinessEvent("PAYMENT_STARTED", "Payment", 
                                         request.getOrderId().toString(), 
                                         "Customer: " + request.getCustomerName());
            
            // Validate payment type
            validatePaymentType(request.getPaymentType());
            
            // Lấy appropriate factory (hiện tại chỉ có Vietnam factory)
            PaymentProviderFactory factory = getPaymentProviderFactory();
            
            // Tạo processor từ factory
            PaymentProcessor processor = factory.createProcessor(request.getPaymentType());
            
            // Xử lý thanh toán
            PaymentResult result = processor.processPayment(request);
            
            // Log kết quả thanh toán
            if (result.getStatus() == PaymentResult.PaymentStatus.SUCCESS) {
                loggerManager.logPayment(request.getPaymentType(), 
                                       request.getAmount().toString(), "SUCCESS");
                loggerManager.logBusinessEvent("PAYMENT_SUCCESS", "Payment", 
                                             request.getOrderId().toString(), 
                                             "Transaction ID: " + result.getTransactionId());
            } else if (result.getStatus() == PaymentResult.PaymentStatus.FAILED) {
                loggerManager.logPayment(request.getPaymentType(), 
                                       request.getAmount().toString(), "FAILED");
                loggerManager.logBusinessEvent("PAYMENT_FAILED", "Payment", 
                                             request.getOrderId().toString(), 
                                             "Error: " + result.getMessage());
            } else {
                loggerManager.logPayment(request.getPaymentType(), 
                                       request.getAmount().toString(), "PENDING");
                loggerManager.logBusinessEvent("PAYMENT_PENDING", "Payment", 
                                             request.getOrderId().toString(), 
                                             "Transaction ID: " + result.getTransactionId());
            }
            
            // Log performance
            long duration = System.currentTimeMillis() - startTime;
            loggerManager.logPerformance("processPayment", duration, 
                                       "Payment Type: " + request.getPaymentType());
            
            // Gửi thông báo sau khi xử lý thanh toán
            sendPaymentNotification(request, result);
            
            return result;
            
        } catch (Exception e) {
            // Log error
            loggerManager.logError("PaymentService", "processPayment", e);
            loggerManager.logPayment(request.getPaymentType(), 
                                   request.getAmount().toString(), "ERROR");
            loggerManager.logBusinessEvent("PAYMENT_ERROR", "Payment", 
                                         request.getOrderId().toString(), 
                                         "Error: " + e.getMessage());
            
            // Log performance even for errors
            long duration = System.currentTimeMillis() - startTime;
            loggerManager.logPerformance("processPayment", duration, 
                                       "Payment Type: " + request.getPaymentType() + " (ERROR)");
            
            return PaymentResult.failed(
                "Có lỗi xảy ra trong quá trình thanh toán: " + e.getMessage(),
                "SYSTEM_ERROR",
                request.getPaymentType()
            );
        }
    }
    
    /**
     * Validate payment request
     * @param request payment request
     * @return true nếu hợp lệ
     */
    public boolean validatePaymentRequest(PaymentRequest request) {
        try {
            loggerManager.logSystemEvent("VALIDATION_STARTED", "PaymentService", 
                                       "Payment Type: " + (request != null ? request.getPaymentType() : "null"));
            
            if (request == null) {
                loggerManager.logSystemEvent("VALIDATION_FAILED", "PaymentService", 
                                           "Request is null");
                return false;
            }
            
            // Validate payment type
            validatePaymentType(request.getPaymentType());
            
            // Lấy processor và validate
            PaymentProviderFactory factory = getPaymentProviderFactory();
            PaymentProcessor processor = factory.createProcessor(request.getPaymentType());
            
            boolean isValid = processor.validatePayment(request);
            
            if (isValid) {
                loggerManager.logSystemEvent("VALIDATION_SUCCESS", "PaymentService", 
                                           "Payment Type: " + request.getPaymentType());
            } else {
                loggerManager.logSystemEvent("VALIDATION_FAILED", "PaymentService", 
                                           "Payment Type: " + request.getPaymentType());
            }
            
            return isValid;
            
        } catch (Exception e) {
            loggerManager.logError("PaymentService", "validatePaymentRequest", e);
            loggerManager.logSystemEvent("VALIDATION_ERROR", "PaymentService", 
                                       "Error: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Lấy danh sách các phương thức thanh toán được hỗ trợ
     * @return danh sách payment types
     */
    public PaymentType[] getSupportedPaymentTypes() {
        loggerManager.logSystemEvent("GET_SUPPORTED_PAYMENT_TYPES", "PaymentService", 
                                   "Returning supported payment types");
        
        // Hiện tại chỉ hỗ trợ CASH, sau này sẽ mở rộng
        return new PaymentType[]{PaymentType.CASH};
    }
    
    /**
     * Validate payment type
     */
    private void validatePaymentType(String paymentType) {
        if (paymentType == null || paymentType.trim().isEmpty()) {
            throw new IllegalArgumentException("Payment type không được để trống");
        }
        
        try {
            PaymentType.fromCode(paymentType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Payment type không được hỗ trợ: " + paymentType);
        }
        
        // Kiểm tra xem có được hỗ trợ trong hệ thống hiện tại không
        if (!PaymentType.CASH.getCode().equals(paymentType)) {
            throw new UnsupportedOperationException("Phương thức thanh toán " + paymentType + " chưa được phát triển. Hiện tại chỉ hỗ trợ thanh toán tiền mặt.");
        }
    }
    
    /**
     * Gửi thông báo thanh toán
     */
    private void sendPaymentNotification(PaymentRequest request, PaymentResult result) {
        try {
            NotificationRequest notificationRequest = new NotificationRequest();
            notificationRequest.setMessage(buildPaymentMessage(request, result));
            notificationRequest.setRecipient(request.getCustomerName());
            notificationRequest.setRecipientEmail(request.getCustomerEmail());
            notificationRequest.setRecipientPhone(request.getCustomerPhone());
            notificationRequest.setTitle(buildNotificationTitle(result));
            notificationRequest.setOrderId(request.getOrderId().toString());
            notificationRequest.setCustomerName(request.getCustomerName());
            
            // Gửi thông báo kết hợp
            notificationManager.sendCombinedNotification(notificationRequest);
            
            loggerManager.logBusinessEvent("NOTIFICATION_SENT", "Payment", 
                                         request.getOrderId().toString(), 
                                         "Notification sent successfully");
            
        } catch (Exception e) {
            loggerManager.logError("PaymentService", "sendPaymentNotification", e);
        }
    }
    
    /**
     * Xây dựng title thông báo dựa trên trạng thái thanh toán
     */
    private String buildNotificationTitle(PaymentResult result) {
        if (result.getStatus() == PaymentResult.PaymentStatus.SUCCESS) {
            return "Thông báo thanh toán thành công";
        } else if (result.getStatus() == PaymentResult.PaymentStatus.PENDING) {
            return "Thông báo đơn hàng";
        } else {
            return "Thông báo thanh toán thất bại";
        }
    }
    
    /**
     * Xây dựng message thông báo thanh toán
     */
    private String buildPaymentMessage(PaymentRequest request, PaymentResult result) {
        if (result.getStatus() == PaymentResult.PaymentStatus.SUCCESS) {
            return String.format("Thanh toán thành công! Đơn hàng #%s với số tiền %s VNĐ đã được xử lý.", 
                               request.getOrderId(), request.getAmount());
        } else if (result.getStatus() == PaymentResult.PaymentStatus.PENDING) {
            return String.format("Đơn hàng #%s với số tiền %s VNĐ đã được tạo thành công. %s", 
                               request.getOrderId(), request.getAmount(), result.getMessage());
        } else {
            return String.format("Thanh toán thất bại! Đơn hàng #%s với số tiền %s VNĐ không thể xử lý. Lý do: %s", 
                               request.getOrderId(), request.getAmount(), result.getMessage());
        }
    }
    
    /**
     * Lấy payment provider factory
     * Hiện tại hardcode Vietnam factory, sau này có thể implement logic để chọn factory
     */
    private PaymentProviderFactory getPaymentProviderFactory() {
        return paymentProviderFactories.stream()
                .filter(factory -> "Vietnam Payment Provider".equals(factory.getProviderName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment provider factory"));
    }
}
