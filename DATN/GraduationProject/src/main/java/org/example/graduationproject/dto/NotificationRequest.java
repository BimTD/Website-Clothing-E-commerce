package org.example.graduationproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.graduationproject.enums.NotificationType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String message;
    private String recipient;
    private String recipientEmail;
    private String recipientPhone;
    private NotificationType type;
    private String title;
    private String orderId;
    private String customerName;
}
