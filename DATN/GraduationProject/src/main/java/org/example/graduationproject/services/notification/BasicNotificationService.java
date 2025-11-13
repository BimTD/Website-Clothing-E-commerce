package org.example.graduationproject.services.notification;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.enums.NotificationType;
import org.springframework.stereotype.Service;

@Service("basicNotificationService")
public class BasicNotificationService implements NotificationService {
    
    @Override
    public NotificationResult sendNotification(NotificationRequest request) {
        try {
            NotificationResult result = NotificationResult.builder()
                    .success(true)
                    .message("Thông báo cơ bản đã được gửi thành công")
                    .type(NotificationType.BASIC)
                    .recipient(request.getRecipient())
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            return result;
            
        } catch (Exception e) {
            return NotificationResult.builder()
                    .success(false)
                    .message("Lỗi gửi thông báo cơ bản: " + e.getMessage())
                    .type(NotificationType.BASIC)
                    .recipient(request.getRecipient())
                    .timestamp(System.currentTimeMillis())
                    .build();
        }
    }
    
    @Override
    public boolean supports(String type) {
        return "BASIC".equalsIgnoreCase(type);
    }
}
