package org.example.graduationproject.enums;

public enum NotificationType {
    BASIC("BASIC", "Thông báo cơ bản"),
    EMAIL("EMAIL", "Thông báo qua email"),
    SMS("SMS", "Thông báo qua SMS"),
    PUSH("PUSH", "Thông báo push"),
    COMBINED("COMBINED", "Thông báo kết hợp");

    private final String code;
    private final String description;

    NotificationType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() { 
        return code; 
    }
    
    public String getDescription() { 
        return description; 
    }
}











