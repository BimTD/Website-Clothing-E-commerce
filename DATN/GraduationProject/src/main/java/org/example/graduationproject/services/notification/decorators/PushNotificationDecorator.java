package org.example.graduationproject.services.notification.decorators;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.enums.NotificationType;
import org.example.graduationproject.services.notification.NotificationService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component("pushNotificationDecorator")
public class PushNotificationDecorator implements NotificationService {
    
    private final NotificationService notificationService;
    
    public PushNotificationDecorator(@Qualifier("basicNotificationService") NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @Override
    public NotificationResult sendNotification(NotificationRequest request) {
        // Gọi service cơ bản trước
        NotificationResult basicResult = notificationService.sendNotification(request);
        
        try {
            // Thêm logic gửi push notification
            System.out.println("=== PUSH NOTIFICATION ===");
            System.out.println("Device: " + request.getRecipient());
            System.out.println("Title: " + (request.getTitle() != null ? request.getTitle() : "Thông báo"));
            System.out.println("Message: " + request.getMessage());
            System.out.println("=========================");
            
            // Simulate push notification
            Thread.sleep(100);
            
            return NotificationResult.builder()
                .success(true)
                .message("Push notification đã được gửi thành công")
                .type(NotificationType.PUSH)
                .recipient(request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
            
        } catch (Exception e) {
            return NotificationResult.builder()
                .success(false)
                .message("Lỗi khi gửi push notification: " + e.getMessage())
                .type(NotificationType.PUSH)
                .recipient(request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
        }
    }
    
    @Override
    public boolean supports(String type) {
        return NotificationType.PUSH.getCode().equals(type);
    }
}
