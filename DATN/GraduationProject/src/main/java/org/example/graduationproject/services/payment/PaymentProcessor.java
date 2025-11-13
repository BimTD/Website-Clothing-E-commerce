package org.example.graduationproject.services.payment;

import org.example.graduationproject.dto.PaymentRequest;
import org.example.graduationproject.dto.PaymentResult;

//factory method pattern
public interface PaymentProcessor {
    

    PaymentResult processPayment(PaymentRequest request);
    

    boolean validatePayment(PaymentRequest request);
    

    String getSupportedPaymentType();
    

    boolean supports(String paymentType);
}








