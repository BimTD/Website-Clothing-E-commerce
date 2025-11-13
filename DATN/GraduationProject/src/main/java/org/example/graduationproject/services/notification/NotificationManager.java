package org.example.graduationproject.services.notification;

import org.example.graduationproject.dto.NotificationRequest;
import org.example.graduationproject.dto.NotificationResult;
import org.example.graduationproject.enums.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.List;
import java.util.ArrayList;

@Service
public class NotificationManager {
    
    private final NotificationService basicNotificationService;
    private final NotificationService emailNotificationDecorator;
    private final NotificationService smsNotificationDecorator;
    private final NotificationService pushNotificationDecorator;
    
    @Autowired
    @Qualifier("notificationTaskExecutor")
    private Executor notificationExecutor;
    
    @Autowired
    public NotificationManager(@Qualifier("basicNotificationService") NotificationService basicNotificationService,
                              @Qualifier("emailNotificationDecorator") NotificationService emailNotificationDecorator,
                              @Qualifier("smsNotificationDecorator") NotificationService smsNotificationDecorator,
                              @Qualifier("pushNotificationDecorator") NotificationService pushNotificationDecorator) {
        this.basicNotificationService = basicNotificationService;
        this.emailNotificationDecorator = emailNotificationDecorator;
        this.smsNotificationDecorator = smsNotificationDecorator;
        this.pushNotificationDecorator = pushNotificationDecorator;
    }
    
    /**
     * Gửi thông báo với decorator pattern (SYNC)
     */
    public NotificationResult sendNotification(NotificationRequest request) {
        NotificationService service = createNotificationService(request.getType());
        return service.sendNotification(request);
    }
    
    /**
     * Gửi thông báo với decorator pattern (ASYNC với @Async)
     */
    @Async("notificationTaskExecutor")
    public CompletableFuture<NotificationResult> sendNotificationAsync(NotificationRequest request) {
        NotificationService service = createNotificationService(request.getType());
        NotificationResult result = service.sendNotification(request);
        return CompletableFuture.completedFuture(result);
    }
    
    /**
     * Gửi thông báo với CompletableFuture.supplyAsync
     */
    public CompletableFuture<NotificationResult> sendNotificationWithCompletableFuture(NotificationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            NotificationService service = createNotificationService(request.getType());
            return service.sendNotification(request);
        }, notificationExecutor);
    }
    
    /**
     * Gửi thông báo kết hợp (nhiều loại) - SYNC
     */
    public NotificationResult sendCombinedNotification(NotificationRequest request) {
        NotificationResult result = NotificationResult.builder()
                .success(true)
                .message("Thông báo kết hợp đã được gửi")
                .type(NotificationType.COMBINED)
                .recipient(request.getRecipient())
                .timestamp(System.currentTimeMillis())
                .build();
        
        // Gửi basic notification
        NotificationResult basicResult = basicNotificationService.sendNotification(request);
        
        // Gửi email nếu có email
        if (request.getRecipientEmail() != null && !request.getRecipientEmail().isEmpty()) {
            NotificationResult emailResult = emailNotificationDecorator.sendNotification(request);
            if (!emailResult.isSuccess()) {
                result = NotificationResult.builder()
                        .success(false)
                        .message(result.getMessage() + " | Email failed: " + emailResult.getMessage())
                        .type(NotificationType.COMBINED)
                        .recipient(request.getRecipient())
                        .timestamp(System.currentTimeMillis())
                        .build();
            }
        }
        
        // Gửi SMS nếu có phone
        if (request.getRecipientPhone() != null && !request.getRecipientPhone().isEmpty()) {
            NotificationResult smsResult = smsNotificationDecorator.sendNotification(request);
            if (!smsResult.isSuccess()) {
                result = NotificationResult.builder()
                        .success(false)
                        .message(result.getMessage() + " | SMS failed: " + smsResult.getMessage())
                        .type(NotificationType.COMBINED)
                        .recipient(request.getRecipient())
                        .timestamp(System.currentTimeMillis())
                        .build();
            }
        }
        
        // Gửi push notification
        NotificationResult pushResult = pushNotificationDecorator.sendNotification(request);
        if (!pushResult.isSuccess()) {
            result = NotificationResult.builder()
                    .success(false)
                    .message(result.getMessage() + " | Push failed: " + pushResult.getMessage())
                    .type(NotificationType.COMBINED)
                    .recipient(request.getRecipient())
                    .timestamp(System.currentTimeMillis())
                    .build();
        }
        
        return result;
    }
    
    /**
     * Gửi thông báo kết hợp (nhiều loại) - ASYNC với @Async
     */
    @Async("notificationTaskExecutor")
    public CompletableFuture<NotificationResult> sendCombinedNotificationAsync(NotificationRequest request) {
        NotificationResult result = sendCombinedNotification(request);
        return CompletableFuture.completedFuture(result);
    }
    
    /**
     * Gửi thông báo kết hợp PARALLEL với CompletableFuture
     * Tất cả notifications chạy song song
     */
    public CompletableFuture<NotificationResult> sendCombinedNotificationParallel(NotificationRequest request) {
        List<CompletableFuture<NotificationResult>> futures = new ArrayList<>();
        
        // Basic notification
        CompletableFuture<NotificationResult> basicFuture = CompletableFuture.supplyAsync(() -> 
            basicNotificationService.sendNotification(request), notificationExecutor);
        futures.add(basicFuture);
        
        // Email notification (nếu có email)
        if (request.getRecipientEmail() != null && !request.getRecipientEmail().isEmpty()) {
            CompletableFuture<NotificationResult> emailFuture = CompletableFuture.supplyAsync(() -> 
                emailNotificationDecorator.sendNotification(request), notificationExecutor);
            futures.add(emailFuture);
        }
        
        // SMS notification (nếu có phone)
        if (request.getRecipientPhone() != null && !request.getRecipientPhone().isEmpty()) {
            CompletableFuture<NotificationResult> smsFuture = CompletableFuture.supplyAsync(() -> 
                smsNotificationDecorator.sendNotification(request), notificationExecutor);
            futures.add(smsFuture);
        }
        
        // Push notification
        CompletableFuture<NotificationResult> pushFuture = CompletableFuture.supplyAsync(() -> 
            pushNotificationDecorator.sendNotification(request), notificationExecutor);
        futures.add(pushFuture);
        
        // Chờ tất cả hoàn thành và combine results
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    boolean allSuccess = futures.stream()
                            .map(CompletableFuture::join)
                            .allMatch(NotificationResult::isSuccess);
                    
                    String message = allSuccess ? 
                        "Tất cả thông báo đã được gửi thành công" : 
                        "Một số thông báo gửi thất bại";
                    
                    return NotificationResult.builder()
                            .success(allSuccess)
                            .message(message)
                            .type(NotificationType.COMBINED)
                            .recipient(request.getRecipient())
                            .timestamp(System.currentTimeMillis())
                            .build();
                });
    }
    
    /**
     * Gửi thông báo với error handling và retry
     */
    public CompletableFuture<NotificationResult> sendNotificationWithRetry(NotificationRequest request, int maxRetries) {
        return CompletableFuture.supplyAsync(() -> {
            int attempts = 0;
            Exception lastException = null;
            
            while (attempts < maxRetries) {
                try {
                    NotificationService service = createNotificationService(request.getType());
                    return service.sendNotification(request);
                } catch (Exception e) {
                    lastException = e;
                    attempts++;
                    if (attempts < maxRetries) {
                        try {
                            Thread.sleep(1000 * attempts); // Exponential backoff
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }
            
            // Nếu tất cả retry đều thất bại
            return NotificationResult.builder()
                    .success(false)
                    .message("Gửi thông báo thất bại sau " + maxRetries + " lần thử: " + 
                            (lastException != null ? lastException.getMessage() : "Unknown error"))
                    .type(request.getType())
                    .recipient(request.getRecipient())
                    .timestamp(System.currentTimeMillis())
                    .build();
        }, notificationExecutor);
    }
    
    /**
     * Gửi nhiều thông báo cùng lúc
     */
    public CompletableFuture<List<NotificationResult>> sendMultipleNotifications(List<NotificationRequest> requests) {
        List<CompletableFuture<NotificationResult>> futures = requests.stream()
                .map(request -> sendNotificationWithCompletableFuture(request))
                .toList();
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .toList());
    }
    
    /**
     * Tạo notification service dựa trên type
     */
    private NotificationService createNotificationService(NotificationType type) {
        switch (type) {
            case EMAIL:
                return emailNotificationDecorator;
            case SMS:
                return smsNotificationDecorator;
            case PUSH:
                return pushNotificationDecorator;
            case COMBINED:
                // Sẽ xử lý riêng trong sendCombinedNotification
                return basicNotificationService;
            default:
                return basicNotificationService;
        }
    }
}
