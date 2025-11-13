package org.example.graduationproject.observers;

import lombok.extern.slf4j.Slf4j;
import org.example.graduationproject.events.OrderStatusChangedEvent;
import org.example.graduationproject.services.notification.NotificationManager;
import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.enums.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InventoryObserver {
    
    @Autowired
    private NotificationManager notificationManager;
    
    /**
     * Xử lý event khi order status thay đổi
     * Cập nhật inventory và gửi thông báo nếu cần
     */
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("InventoryObserver: Processing order status change for order #{}", event.getOrderId());
        
        try {
            // Xử lý inventory dựa trên status change
            processInventoryUpdate(event);
            
            // Gửi thông báo inventory nếu cần
            if (shouldSendInventoryNotification(event)) {
                sendInventoryNotification(event);
            }
            
            log.info("InventoryObserver: Successfully processed event for order #{}", event.getOrderId());
            
        } catch (Exception e) {
            log.error("InventoryObserver: Error processing event for order #{}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }
    
    /**
     * Xử lý cập nhật inventory
     */
    private void processInventoryUpdate(OrderStatusChangedEvent event) {
        String newStatus = event.getNewStatus().toUpperCase();
        String oldStatus = event.getOldStatus().toUpperCase();
        
        switch (newStatus) {
            case "CONFIRMED":
                if ("PENDING".equals(oldStatus)) {
                    // Trừ stock khi order được xác nhận
                    log.info("InventoryObserver: Deducting stock for confirmed order #{}", event.getOrderId());
                    // TODO: Implement stock deduction logic
                }
                break;
                
            case "CANCELLED":
                if ("CONFIRMED".equals(oldStatus)) {
                    // Hoàn lại stock khi order bị hủy
                    log.info("InventoryObserver: Restoring stock for cancelled order #{}", event.getOrderId());
                    // TODO: Implement stock restoration logic
                }
                break;
                
            case "DELIVERED":
            case "COMPLETED":
                // Order hoàn thành - có thể cập nhật inventory reports
                log.info("InventoryObserver: Order #{} completed, updating inventory reports", event.getOrderId());
                // TODO: Implement inventory reporting logic
                break;
        }
    }
    
    /**
     * Kiểm tra xem có cần gửi thông báo inventory không
     */
    private boolean shouldSendInventoryNotification(OrderStatusChangedEvent event) {
        String newStatus = event.getNewStatus().toUpperCase();
        return "CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus);
    }
    
    /**
     * Gửi thông báo inventory
     */
    private void sendInventoryNotification(OrderStatusChangedEvent event) {
        String message = buildInventoryMessage(event);
        String title = buildInventoryTitle(event);
        
        NotificationRequest request = NotificationRequest.builder()
                .message(message)
                .title(title)
                .recipient("Inventory Manager")
                .type(NotificationType.COMBINED)
                .build();
        
        notificationManager.sendCombinedNotification(request);
        
        log.info("InventoryObserver: Sent inventory notification for order #{}", event.getOrderId());
    }
    
    /**
     * Xây dựng message cho inventory notification
     */
    private String buildInventoryMessage(OrderStatusChangedEvent event) {
        String newStatus = event.getNewStatus().toUpperCase();
        
        switch (newStatus) {
            case "CONFIRMED":
                return String.format("Đơn hàng #%d đã được xác nhận. Cần trừ tồn kho cho các sản phẩm.", 
                        event.getOrderId());
            case "CANCELLED":
                return String.format("Đơn hàng #%d đã bị hủy. Cần hoàn lại tồn kho cho các sản phẩm.", 
                        event.getOrderId());
            default:
                return String.format("Đơn hàng #%d - Trạng thái thay đổi: %s -> %s", 
                        event.getOrderId(), event.getOldStatus(), event.getNewStatus());
        }
    }
    
    /**
     * Xây dựng title cho inventory notification
     */
    private String buildInventoryTitle(OrderStatusChangedEvent event) {
        String newStatus = event.getNewStatus().toUpperCase();
        
        switch (newStatus) {
            case "CONFIRMED":
                return "Cập nhật tồn kho - Đơn hàng được xác nhận";
            case "CANCELLED":
                return "Cập nhật tồn kho - Đơn hàng bị hủy";
            default:
                return "Cập nhật tồn kho";
        }
    }
}







