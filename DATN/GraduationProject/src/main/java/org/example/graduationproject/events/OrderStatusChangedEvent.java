package org.example.graduationproject.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedEvent {

    private Integer orderId;
    private String oldStatus;
    private String newStatus;
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private BigDecimal orderTotal;
    private LocalDateTime timestamp;
    private String changeReason; // "ADMIN_UPDATE", "SYSTEM_AUTO", "CUSTOMER_CANCEL"

    // Constructor tiện ích
    public OrderStatusChangedEvent(Integer orderId, String oldStatus, String newStatus) {
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.timestamp = LocalDateTime.now();
    }

    // Getter với null safety
    public String getOldStatus() {
        return oldStatus != null ? oldStatus : "NEW";
    }
    
    public String getNewStatus() {
        return newStatus != null ? newStatus : "UNKNOWN";
    }
}
