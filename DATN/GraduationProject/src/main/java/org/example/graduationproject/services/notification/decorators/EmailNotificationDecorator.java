package org.example.graduationproject.services.notification.decorators;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.enums.NotificationType;
import org.example.graduationproject.services.notification.NotificationService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component("emailNotificationDecorator")
public class EmailNotificationDecorator implements NotificationService {
    
    private final NotificationService notificationService;
    
    public EmailNotificationDecorator(@Qualifier("basicNotificationService") NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @Override
    public NotificationResult sendNotification(NotificationRequest request) {
        // Gọi service cơ bản trước
        NotificationResult basicResult = notificationService.sendNotification(request);
        
        try {
            // Thêm logic gửi email
            System.out.println("=== EMAIL NOTIFICATION ===");
            System.out.println("Email: " + (request.getRecipientEmail() != null ? request.getRecipientEmail() : request.getRecipient()));
            System.out.println("Subject: " + (request.getTitle() != null ? request.getTitle() : "Thông báo từ hệ thống"));
            System.out.println("Body: " + request.getMessage());
            System.out.println("==========================");
            
            // Simulate email sending
            Thread.sleep(200);
            
            return NotificationResult.builder()
                .success(true)
                .message("Email đã được gửi thành công")
                .type(NotificationType.EMAIL)
                .recipient(request.getRecipientEmail() != null ? request.getRecipientEmail() : request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
            
        } catch (Exception e) {
            return NotificationResult.builder()
                .success(false)
                .message("Lỗi khi gửi email: " + e.getMessage())
                .type(NotificationType.EMAIL)
                .recipient(request.getRecipientEmail() != null ? request.getRecipientEmail() : request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
        }
    }
    
    @Override
    public boolean supports(String type) {
        return NotificationType.EMAIL.getCode().equals(type);
    }
}
