package org.example.graduationproject.observers;

import lombok.extern.slf4j.Slf4j;
import org.example.graduationproject.events.OrderStatusChangedEvent;
import org.example.graduationproject.utils.LoggerManager;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuditLoggingObserver {
    
    private final LoggerManager loggerManager = LoggerManager.getInstance();
    
    /**
     * Xử lý event khi order status thay đổi
     * Ghi log audit trail cho mọi thay đổi
     */
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("AuditLoggingObserver: Processing order status change for order #{}", event.getOrderId());
        
        try {
            // Ghi business event log
            logBusinessEvent(event);
            
            // Ghi security event log nếu cần
            if (isSecurityRelevant(event)) {
                logSecurityEvent(event);
            }
            
            // Ghi performance log
            logPerformanceEvent(event);
            
            log.info("AuditLoggingObserver: Successfully logged event for order #{}", event.getOrderId());
            
        } catch (Exception e) {
            log.error("AuditLoggingObserver: Error logging event for order #{}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }
    
    /**
     * Ghi business event log
     */
    private void logBusinessEvent(OrderStatusChangedEvent event) {
        String eventType = "ORDER_STATUS_CHANGED";
        String entityType = "Order";
        String entityId = event.getOrderId().toString();
        String details = String.format("Status changed from %s to %s | Customer: %s | Total: %s", 
                event.getOldStatus(), 
                event.getNewStatus(),
                event.getCustomerName() != null ? event.getCustomerName() : "N/A",
                event.getOrderTotal() != null ? event.getOrderTotal().toString() : "N/A");
        
        loggerManager.logBusinessEvent(eventType, entityType, entityId, details);
    }
    
    /**
     * Ghi security event log nếu cần
     */
    private void logSecurityEvent(OrderStatusChangedEvent event) {
        String eventType = "ORDER_STATUS_SECURITY";
        String entityType = "Order";
        String entityId = event.getOrderId().toString();
        String details = String.format("Security relevant status change: %s -> %s | Customer: %s", 
                event.getOldStatus(), 
                event.getNewStatus(),
                event.getCustomerName() != null ? event.getCustomerName() : "N/A");
        
        loggerManager.logSecurityEvent(eventType, entityType, entityId, details);
    }
    
    /**
     * Ghi performance event log
     */
    private void logPerformanceEvent(OrderStatusChangedEvent event) {
        String operation = "orderStatusChange";
        long duration = 0; // TODO: Calculate actual duration if needed
        String details = String.format("Order #%d status changed from %s to %s", 
                event.getOrderId(), event.getOldStatus(), event.getNewStatus());
        
        loggerManager.logPerformance(operation, duration, details);
    }
    
    /**
     * Kiểm tra xem event có liên quan đến security không
     */
    private boolean isSecurityRelevant(OrderStatusChangedEvent event) {
        // Kiểm tra null trước khi gọi toUpperCase()
        if (event.getNewStatus() == null) {
            return false;
        }
        
        String newStatus = event.getNewStatus().toUpperCase();
        
        // Nếu oldStatus là null hoặc "NEW" (order mới), chỉ kiểm tra newStatus
        if (event.getOldStatus() == null || "NEW".equalsIgnoreCase(event.getOldStatus())) {
            return "PENDING".equals(newStatus) ||           // Đơn hàng mới
                   "CONFIRMED".equals(newStatus) ||         // Đơn hàng được xác nhận
                   "SHIPPING".equals(newStatus) ||          // Đơn hàng đang giao
                   "DELIVERED".equals(newStatus) ||         // Đơn hàng đã giao
                   "COMPLETED".equals(newStatus);           // Đơn hàng hoàn thành
        }
        
        String oldStatus = event.getOldStatus().toUpperCase();
        
        // Các thay đổi status quan trọng về security
        return "CANCELLED".equals(newStatus) ||           // Đơn hàng bị hủy
               "PENDING".equals(newStatus) ||             // Đơn hàng mới
               "CONFIRMED".equals(newStatus) ||           // Đơn hàng được xác nhận
               "SHIPPING".equals(newStatus) ||            // Đơn hàng đang giao
               "DELIVERED".equals(newStatus) ||           // Đơn hàng đã giao
               "COMPLETED".equals(newStatus);             // Đơn hàng hoàn thành
    }
}


