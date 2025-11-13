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
public class AdminNotificationObserver {
    
    @Autowired
    private NotificationManager notificationManager;
    
    /**
     * Xử lý event khi order status thay đổi
     * Gửi thông báo cho admin và cập nhật dashboard
     */
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("AdminNotificationObserver: Processing order status change for order #{}", event.getOrderId());
        
        try {
            // Gửi thông báo cho admin nếu cần
            if (shouldNotifyAdmin(event)) {
                sendAdminNotification(event);
            }
            
            // Cập nhật admin dashboard (có thể implement sau)
            updateAdminDashboard(event);
            
            log.info("AdminNotificationObserver: Successfully processed event for order #{}", event.getOrderId());
            
        } catch (Exception e) {
            log.error("AdminNotificationObserver: Error processing event for order #{}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }
    
    /**
     * Kiểm tra xem có cần gửi thông báo cho admin không
     */
    private boolean shouldNotifyAdmin(OrderStatusChangedEvent event) {
        // Gửi thông báo cho admin trong các trường hợp quan trọng
        return "PENDING".equalsIgnoreCase(event.getNewStatus()) ||  // Có đơn hàng mới
               "CANCELLED".equalsIgnoreCase(event.getNewStatus()) || // Đơn hàng bị hủy
               "SHIPPING".equalsIgnoreCase(event.getNewStatus());    // Đơn hàng đang giao
    }
    
    /**
     * Gửi thông báo cho admin
     */
    private void sendAdminNotification(OrderStatusChangedEvent event) {
        String message = buildAdminMessage(event);
        String title = buildAdminTitle(event);
        
        NotificationRequest request = NotificationRequest.builder()
                .message(message)
                .title(title)
                .recipient("Admin")
                .type(NotificationType.COMBINED)
                .build();
        
        notificationManager.sendCombinedNotification(request);
        
        log.info("AdminNotificationObserver: Sent admin notification for order #{}", event.getOrderId());
    }
    
    /**
     * Cập nhật admin dashboard
     */
    private void updateAdminDashboard(OrderStatusChangedEvent event) {
        // TODO: Implement dashboard update logic
        // Có thể sử dụng WebSocket để update real-time
        log.info("AdminNotificationObserver: Dashboard update for order #{} - Status: {} -> {}", 
                event.getOrderId(), event.getOldStatus(), event.getNewStatus());
    }
    
    /**
     * Xây dựng message cho admin
     */
    private String buildAdminMessage(OrderStatusChangedEvent event) {
        switch (event.getNewStatus().toUpperCase()) {
            case "PENDING":
                return String.format("Có đơn hàng mới #%d cần xử lý. Khách hàng: %s", 
                        event.getOrderId(), 
                        event.getCustomerName() != null ? event.getCustomerName() : "N/A");
            case "CANCELLED":
                return String.format("Đơn hàng #%d đã bị hủy. Khách hàng: %s", 
                        event.getOrderId(), 
                        event.getCustomerName() != null ? event.getCustomerName() : "N/A");
            case "SHIPPING":
                return String.format("Đơn hàng #%d đang được giao hàng. Khách hàng: %s", 
                        event.getOrderId(), 
                        event.getCustomerName() != null ? event.getCustomerName() : "N/A");
            default:
                return String.format("Trạng thái đơn hàng #%d đã thay đổi từ %s thành %s", 
                        event.getOrderId(), event.getOldStatus(), event.getNewStatus());
        }
    }
    
    /**
     * Xây dựng title cho admin notification
     */
    private String buildAdminTitle(OrderStatusChangedEvent event) {
        switch (event.getNewStatus().toUpperCase()) {
            case "PENDING":
                return "Đơn hàng mới cần xử lý";
            case "CANCELLED":
                return "Đơn hàng đã bị hủy";
            case "SHIPPING":
                return "Đơn hàng đang giao hàng";
            default:
                return "Cập nhật trạng thái đơn hàng";
        }
    }
}







