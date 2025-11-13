package org.example.graduationproject.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;


public class LoggerManager {
    
    // Volatile để đảm bảo thread-safe trong multi-threaded environment
    private static volatile LoggerManager instance;
    
    private final ConcurrentHashMap<String, Logger> loggers;
    private final DateTimeFormatter formatter;
    
    // Private constructor để prevent instantiation từ bên ngoài
    private LoggerManager() {
        this.loggers = new ConcurrentHashMap<>();
        this.formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }
    

    public static LoggerManager getInstance() {
        // First check (không cần lock)
        if (instance == null) {
            // Synchronize chỉ khi instance chưa được tạo
            synchronized (LoggerManager.class) {
                // Second check (double-checked locking)
                if (instance == null) {
                    instance = new LoggerManager();
                }
            }
        }
        return instance;
    }

    public Logger getLogger(Class<?> clazz) {
        String className = clazz.getName();
        return loggers.computeIfAbsent(className, LoggerFactory::getLogger);
    }

    public void logPayment(String paymentType, String amount, String status) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.info("[{}] Payment processed - Type: {}, Amount: {}, Status: {}", 
                   timestamp, paymentType, amount, status);
    }

    public void logUserAction(String username, String action, String details) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.info("[{}] User Action - User: {}, Action: {}, Details: {}", 
                   timestamp, username, action, details);
    }

    public void logError(String className, String methodName, Exception exception) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.error("[{}] Error in {}.{}: {}", timestamp, className, methodName, exception.getMessage());
    }
    

    public void logBusinessEvent(String eventType, String entityType, String entityId, String details) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.info("[{}] Business Event - Type: {}, Entity: {}, ID: {}, Details: {}", 
                   timestamp, eventType, entityType, entityId, details);
    }
    

    public void logSystemEvent(String eventType, String component, String details) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.info("[{}] System Event - Type: {}, Component: {}, Details: {}", 
                   timestamp, eventType, component, details);
    }
    

    public void logSecurityEvent(String eventType, String entityType, String entityId, String details) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.warn("[{}] Security Event - Type: {}, Entity: {}, ID: {}, Details: {}", 
                   timestamp, eventType, entityType, entityId, details);
    }
    

    public void logPerformance(String operation, long duration, String details) {
        Logger logger = getLogger(LoggerManager.class);
        String timestamp = LocalDateTime.now().format(formatter);
        logger.info("[{}] Performance - Operation: {}, Duration: {}ms, Details: {}", 
                   timestamp, operation, duration, details);
    }
    

    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException("Singleton cannot be cloned");
    }
    

    protected Object readResolve() {
        return getInstance();
    }
}




