package org.example.graduationproject.enums;

public enum PaymentType {
    CASH("CASH", "Tiền mặt khi nhận hàng", false, false);
    
    // Sẽ được thêm sau khi implement
    // BANK_TRANSFER("BANK_TRANSFER", "Chuyển khoản ngân hàng", true, true),
    // CREDIT_CARD("CREDIT_CARD", "Thẻ tín dụng", true, false),
    // E_WALLET("E_WALLET", "Ví điện tử", true, false);
    
    private final String code;
    private final String displayName;
    private final boolean requiresOnlineProcessing;
    private final boolean requiresBankInfo;
    
    PaymentType(String code, String displayName, boolean requiresOnlineProcessing, boolean requiresBankInfo) {
        this.code = code;
        this.displayName = displayName;
        this.requiresOnlineProcessing = requiresOnlineProcessing;
        this.requiresBankInfo = requiresBankInfo;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isRequiresOnlineProcessing() {
        return requiresOnlineProcessing;
    }
    
    public boolean isRequiresBankInfo() {
        return requiresBankInfo;
    }
    
    public static PaymentType fromCode(String code) {
        for (PaymentType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown payment type: " + code);
    }
}










