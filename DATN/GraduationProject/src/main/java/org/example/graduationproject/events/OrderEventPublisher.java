package org.example.graduationproject.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderEventPublisher {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    /**
     * Publish event khi order status thay đổi
     */
    public void publishOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("Publishing OrderStatusChangedEvent: Order #{} from {} to {}", 
                event.getOrderId(), event.getOldStatus(), event.getNewStatus());
        eventPublisher.publishEvent(event);
    }
    
    /**
     * Publish event với thông tin cơ bản
     */
    public void publishOrderStatusChanged(Integer orderId, String oldStatus, String newStatus) {
        OrderStatusChangedEvent event = OrderStatusChangedEvent.builder()
                .orderId(orderId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        publishOrderStatusChanged(event);
    }
}


