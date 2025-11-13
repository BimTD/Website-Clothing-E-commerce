package org.example.graduationproject.services.payment.factory;

import org.example.graduationproject.services.payment.PaymentProcessor;

/**
 * Abstract Factory Pattern - Factory of Factories
 * Quản lý các factory khác nhau cho các nhà cung cấp thanh toán
 */
public abstract class PaymentProviderFactory {
    

    public abstract PaymentProcessor createCashProcessor();
    

    public abstract PaymentProcessor createBankTransferProcessor();
    

    public abstract PaymentProcessor createCreditCardProcessor();
    

    public abstract PaymentProcessor createEWalletProcessor();
    

    public abstract String getProviderName();
    

    public PaymentProcessor createProcessor(String paymentType) {
        switch (paymentType) {
            case "CASH":
                return createCashProcessor();
            // TODO: Uncomment khi implement các payment methods khác
            // case "BANK_TRANSFER":
            //     return createBankTransferProcessor();
            // case "CREDIT_CARD":
            //     return createCreditCardProcessor();
            // case "E_WALLET":
            //     return createEWalletProcessor();
            default:
                throw new IllegalArgumentException("Phương thức thanh toán không được hỗ trợ: " + paymentType + ". Hiện tại chỉ hỗ trợ CASH.");
        }
    }
}
