package org.example.graduationproject.services.notification;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;

public interface NotificationService {

    NotificationResult sendNotification(NotificationRequest request);
    

    boolean supports(String type);
}











