package org.example.graduationproject.services.payment.factory;

import org.example.graduationproject.services.payment.PaymentProcessor;

//Abstract Factory Pattern
public interface PaymentFactory {
    

    PaymentProcessor createPaymentProcessor(String paymentType);
    

    boolean supports(String paymentType);
    

    String getFactoryName();
}








