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
public class CustomerNotificationObserver {
    
    @Autowired
    private NotificationManager notificationManager;
    
    /**
     * Xử lý event khi order status thay đổi
     * Gửi thông báo cho customer
     */
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("CustomerNotificationObserver: Processing order status change for order #{}", event.getOrderId());
        
        try {
            // Tạo notification request
            NotificationRequest request = createNotificationRequest(event);
            
            // Gửi thông báo
            notificationManager.sendCombinedNotification(request);
            
            log.info("CustomerNotificationObserver: Successfully sent notification for order #{}", event.getOrderId());
            
        } catch (Exception e) {
            log.error("CustomerNotificationObserver: Error sending notification for order #{}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }
    
    /**
     * Tạo notification request dựa trên status change
     */
    private NotificationRequest createNotificationRequest(OrderStatusChangedEvent event) {
        String message = buildCustomerMessage(event);
        String title = buildCustomerTitle(event);
        
        return NotificationRequest.builder()
                .message(message)
                .title(title)
                .recipient(event.getCustomerName() != null ? event.getCustomerName() : "Khách hàng")
                .recipientEmail(event.getCustomerEmail())
                .recipientPhone(event.getCustomerPhone())
                .type(NotificationType.COMBINED)
                .build();
    }
    
    /**
     * Xây dựng message cho customer
     */
    private String buildCustomerMessage(OrderStatusChangedEvent event) {
        switch (event.getNewStatus().toUpperCase()) {
            case "CONFIRMED":
                return String.format("Đơn hàng #%d của bạn đã được xác nhận và đang được chuẩn bị giao hàng!", 
                        event.getOrderId());
            case "SHIPPING":
                return String.format("Đơn hàng #%d của bạn đang được giao hàng! Vui lòng chuẩn bị nhận hàng.", 
                        event.getOrderId());
            case "DELIVERED":
                return String.format("Đơn hàng #%d của bạn đã được giao thành công! Cảm ơn bạn đã mua hàng.", 
                        event.getOrderId());
            case "CANCELLED":
                return String.format("Đơn hàng #%d của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.", 
                        event.getOrderId());
            case "COMPLETED":
                return String.format("Đơn hàng #%d của bạn đã hoàn thành! Cảm ơn bạn đã mua hàng.", 
                        event.getOrderId());
            default:
                return String.format("Trạng thái đơn hàng #%d đã được cập nhật thành: %s", 
                        event.getOrderId(), event.getNewStatus());
        }
    }
    
    /**
     * Xây dựng title cho notification
     */
    private String buildCustomerTitle(OrderStatusChangedEvent event) {
        switch (event.getNewStatus().toUpperCase()) {
            case "CONFIRMED":
                return "Đơn hàng đã được xác nhận";
            case "SHIPPING":
                return "Đơn hàng đang được giao";
            case "DELIVERED":
                return "Đơn hàng đã được giao";
            case "CANCELLED":
                return "Đơn hàng đã bị hủy";
            case "COMPLETED":
                return "Đơn hàng hoàn thành";
            default:
                return "Cập nhật trạng thái đơn hàng";
        }
    }
}







