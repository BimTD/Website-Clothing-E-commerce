package org.example.graduationproject.services.payment.factory;

import org.example.graduationproject.services.payment.PaymentProcessor;
import org.example.graduationproject.services.payment.processors.CashPaymentProcessor;
import org.springframework.stereotype.Component;

/**
 * Concrete Factory cho các nhà cung cấp thanh toán Việt Nam
 * Implements Abstract Factory pattern
 */
@Component
public class VietnamPaymentProviderFactory extends PaymentProviderFactory {
    
    @Override
    public PaymentProcessor createCashProcessor() {
        return new CashPaymentProcessor();
    }
    
    @Override
    public PaymentProcessor createBankTransferProcessor() {

        throw new UnsupportedOperationException("Phương thức chuyển khoản ngân hàng chưa được phát triển");
    }
    
    @Override
    public PaymentProcessor createCreditCardProcessor() {

        throw new UnsupportedOperationException("Phương thức thanh toán thẻ tín dụng chưa được phát triển");
    }
    
    @Override
    public PaymentProcessor createEWalletProcessor() {

        throw new UnsupportedOperationException("Phương thức ví điện tử chưa được phát triển");
    }
    
    @Override
    public String getProviderName() {
        return "Vietnam Payment Provider";
    }
}
