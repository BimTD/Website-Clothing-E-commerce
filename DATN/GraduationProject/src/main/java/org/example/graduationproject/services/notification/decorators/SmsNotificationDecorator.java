package org.example.graduationproject.services.notification.decorators;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.enums.NotificationType;
import org.example.graduationproject.services.notification.NotificationService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component("smsNotificationDecorator")
public class SmsNotificationDecorator implements NotificationService {
    
    private final NotificationService notificationService;
    
    public SmsNotificationDecorator(@Qualifier("basicNotificationService") NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @Override
    public NotificationResult sendNotification(NotificationRequest request) {
        // Gọi service cơ bản trước
        NotificationResult basicResult = notificationService.sendNotification(request);
        
        try {
            // Thêm logic gửi SMS
            System.out.println("=== SMS NOTIFICATION ===");
            System.out.println("Phone: " + (request.getRecipientPhone() != null ? request.getRecipientPhone() : request.getRecipient()));
            System.out.println("Message: " + request.getMessage());
            System.out.println("========================");
            
            // Simulate SMS sending
            Thread.sleep(150);
            
            return NotificationResult.builder()
                .success(true)
                .message("SMS đã được gửi thành công")
                .type(NotificationType.SMS)
                .recipient(request.getRecipientPhone() != null ? request.getRecipientPhone() : request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
            
        } catch (Exception e) {
            return NotificationResult.builder()
                .success(false)
                .message("Lỗi khi gửi SMS: " + e.getMessage())
                .type(NotificationType.SMS)
                .recipient(request.getRecipientPhone() != null ? request.getRecipientPhone() : request.getRecipient())
                .build();
        }
    }
    
    @Override
    public boolean supports(String type) {
        return NotificationType.SMS.getCode().equals(type);
    }
}
