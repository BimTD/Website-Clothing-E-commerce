package org.example.graduationproject.controllers;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.enums.NotificationType;
import org.example.graduationproject.services.notification.NotificationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationManager notificationManager;
    
    @PostMapping("/send")
    public ServiceResult<NotificationResult> sendNotification(@RequestBody NotificationRequest request) {
        try {
            NotificationResult result = notificationManager.sendNotification(request);
            return ServiceResult.ok("Gửi thông báo thành công", result);
        } catch (Exception e) {
            return ServiceResult.serverError("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }
    
    @PostMapping("/send-combined")
    public ServiceResult<NotificationResult> sendCombinedNotification(@RequestBody NotificationRequest request) {
        try {
            NotificationResult result = notificationManager.sendCombinedNotification(request);
            return ServiceResult.ok("Gửi thông báo kết hợp thành công", result);
        } catch (Exception e) {
            return ServiceResult.serverError("Lỗi khi gửi thông báo kết hợp: " + e.getMessage());
        }
    }
    
    @GetMapping("/types")
    public ServiceResult<NotificationType[]> getNotificationTypes() {
        return ServiceResult.ok("Lấy danh sách loại thông báo thành công", NotificationType.values());
    }
}
