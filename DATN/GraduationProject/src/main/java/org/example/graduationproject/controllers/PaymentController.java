package org.example.graduationproject.controllers;

import org.example.graduationproject.dto.PaymentRequest;
import org.example.graduationproject.dto.PaymentResult;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.enums.PaymentType;
import org.example.graduationproject.services.payment.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Payment Controller - expose payment APIs
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController extends BaseController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * API xử lý thanh toán
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        try {
            PaymentResult result = paymentService.processPayment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", result.getStatus() != PaymentResult.PaymentStatus.FAILED);
            response.put("status", result.getStatus());
            response.put("message", result.getMessage());
            response.put("transactionId", result.getTransactionId());
            response.put("amount", result.getAmount());
            response.put("paymentMethod", result.getPaymentMethod());
            response.put("processedAt", result.getProcessedAt());
            
            if (result.getStatus() == PaymentResult.PaymentStatus.FAILED) {
                response.put("errorCode", result.getErrorCode());
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * API lấy danh sách phương thức thanh toán được hỗ trợ
     */
    @GetMapping("/methods")
    public ResponseEntity<?> getPaymentMethods() {
        try {
            PaymentType[] supportedTypes = paymentService.getSupportedPaymentTypes();
            
            List<Map<String, Object>> methods = Arrays.stream(supportedTypes)
                    .map(this::mapPaymentTypeToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ServiceResult.ok("Lấy danh sách phương thức thanh toán thành công", methods));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ServiceResult.serverError("Có lỗi xảy ra: " + e.getMessage()));
        }
    }
    
    /**
     * API validate payment request
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validatePayment(@RequestBody PaymentRequest request) {
        try {
            boolean isValid = paymentService.validatePaymentRequest(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("message", isValid ? "Payment request hợp lệ" : "Payment request không hợp lệ");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Có lỗi xảy ra khi validate: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Map PaymentType to response format
     */
    private Map<String, Object> mapPaymentTypeToResponse(PaymentType paymentType) {
        Map<String, Object> method = new HashMap<>();
        method.put("code", paymentType.getCode());
        method.put("displayName", paymentType.getDisplayName());
        method.put("requiresOnlineProcessing", paymentType.isRequiresOnlineProcessing());
        method.put("requiresBankInfo", paymentType.isRequiresBankInfo());
        method.put("icon", getPaymentIcon(paymentType));
        return method;
    }
    
    /**
     * Lấy icon cho payment type
     */
    private String getPaymentIcon(PaymentType paymentType) {
        switch (paymentType) {
            case CASH:
                return "/assets/images/cash-icon.svg";
            // TODO: Uncomment khi implement các payment methods khác
            // case BANK_TRANSFER:
            //     return "/assets/images/bank-icon.svg";
            // case CREDIT_CARD:
            //     return "/assets/images/card-icon.svg";
            // case E_WALLET:
            //     return "/assets/images/wallet-icon.svg";
            default:
                return "/assets/images/payment-icon.svg";
        }
    }
}
