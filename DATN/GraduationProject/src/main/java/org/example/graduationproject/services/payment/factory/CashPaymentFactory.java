package org.example.graduationproject.services.payment.factory;

import org.example.graduationproject.enums.PaymentType;
import org.example.graduationproject.services.payment.PaymentProcessor;
import org.example.graduationproject.services.payment.processors.CashPaymentProcessor;
import org.springframework.stereotype.Component;


@Component
public class CashPaymentFactory implements PaymentFactory {
    
    @Override
    public PaymentProcessor createPaymentProcessor(String paymentType) {
        if (!supports(paymentType)) {
            throw new IllegalArgumentException("Payment type " + paymentType + " is not supported by CashPaymentFactory");
        }
        
        // Factory Method - tạo instance cụ thể
        return new CashPaymentProcessor();
    }
    
    @Override
    public boolean supports(String paymentType) {
        return PaymentType.CASH.getCode().equals(paymentType);
    }
    
    @Override
    public String getFactoryName() {
        return "CashPaymentFactory";
    }
}


