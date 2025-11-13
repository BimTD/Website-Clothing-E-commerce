package org.example.graduationproject.security;

import org.example.graduationproject.utils.LoggerManager;
import org.example.graduationproject.exceptions.AccountLockedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Proxy cho UserDetailsService
 * Cung cấp caching, rate limiting và logging
 */
@Service
@Primary
public class UserDetailsServiceProxy implements UserDetailsService {
    
    @Autowired
    private JpaUserDetailsService realService;
    
    private final LoggerManager loggerManager = LoggerManager.getInstance();
    
    // Cache cho user details (username -> UserDetails)
    private final Map<String, UserDetails> userCache = new ConcurrentHashMap<>();
    
    // Track login attempts (username -> count)
    private final Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();
    
    // Track last failed attempt time (username -> timestamp)
    private final Map<String, Long> lastFailedAttemptTime = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;
    private static final long CACHE_DURATION_MINUTES = 30;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        long startTime = System.currentTimeMillis();
        
        try {
            // SECURITY CHECK - Rate limiting
            if (isAccountLocked(username)) {
                loggerManager.logSecurityEvent("ACCOUNT_LOCKED", "User", username, 
                    "Account locked due to too many failed attempts");
                throw new AccountLockedException("Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. " +
                    "Vui lòng thử lại sau " + LOCK_DURATION_MINUTES + " phút.");
            }
            
            // CACHE CHECK
            UserDetails cached = userCache.get(username);
            if (cached != null && !isCacheExpired(username)) {
                loggerManager.logSecurityEvent("CACHE_HIT", "User", username, 
                    "User details loaded from cache");
                loggerManager.logPerformance("loadUserByUsername", 
                    System.currentTimeMillis() - startTime, "Cache hit for user: " + username);
                return cached;
            }
            
            // Gọi service thật
            loggerManager.logSecurityEvent("AUTH_ATTEMPT", "User", username, "Attempting authentication");

            // Gọi JpaUserDetailsService
            UserDetails userDetails = realService.loadUserByUsername(username);
            
            // Lưu vào cache
            userCache.put(username, userDetails);
            lastFailedAttemptTime.remove(username); // Reset failed attempts
            loginAttempts.remove(username);
            
            // LOG SUCCESS
            long duration = System.currentTimeMillis() - startTime;
            loggerManager.logSecurityEvent("AUTH_SUCCESS", "User", username, 
                "User authenticated successfully");
            loggerManager.logPerformance("loadUserByUsername", duration, 
                "Authentication successful for user: " + username);
            
            return userDetails;
            
        } catch (UsernameNotFoundException e) {
            // TRACK FAILED ATTEMPTS - Security monitoring
            trackFailedAttempt(username);
            
            long duration = System.currentTimeMillis() - startTime;
            loggerManager.logSecurityEvent("AUTH_FAILED", "User", username, 
                "Authentication failed: User not found");
            loggerManager.logPerformance("loadUserByUsername", duration, 
                "Authentication failed for user: " + username);
            
            throw e;
            
        } catch (Exception e) {
            // TRACK FAILED ATTEMPTS - Security monitoring
            trackFailedAttempt(username);
            
            long duration = System.currentTimeMillis() - startTime;
            loggerManager.logSecurityEvent("AUTH_ERROR", "User", username, 
                "Authentication error: " + e.getMessage());
            loggerManager.logPerformance("loadUserByUsername", duration, 
                "Authentication error for user: " + username);
            
            throw e;
        }
    }

     //Kiểm tra tài khoản có bị khóa không
    private boolean isAccountLocked(String username) {
        Integer attempts = loginAttempts.get(username);
        if (attempts == null || attempts < MAX_LOGIN_ATTEMPTS) {
            return false;
        }
        
        Long lastFailedTime = lastFailedAttemptTime.get(username);
        if (lastFailedTime == null) {
            return false;
        }
        
        long timeSinceLastFailed = System.currentTimeMillis() - lastFailedTime;
        long lockDurationMs = TimeUnit.MINUTES.toMillis(LOCK_DURATION_MINUTES);
        
        // Nếu đã qua thời gian khóa, reset
        if (timeSinceLastFailed > lockDurationMs) {
            loginAttempts.remove(username);
            lastFailedAttemptTime.remove(username);
            return false;
        }
        
        return true;
    }

    //Kiểm tra cache có hết hạn không
    private boolean isCacheExpired(String username) {
        // Cache không hết hạn trong demo này
        // Có thể thêm logic expiration nếu cần
        return false;
    }
    
    //Theo dõi lần đăng nhập thất bại
    private void trackFailedAttempt(String username) {
        int currentAttempts = loginAttempts.getOrDefault(username, 0);
        currentAttempts++;
        loginAttempts.put(username, currentAttempts);
        lastFailedAttemptTime.put(username, System.currentTimeMillis());
        
        loggerManager.logSecurityEvent("LOGIN_ATTEMPT_TRACKED", "User", username, 
            "Failed attempt " + currentAttempts + "/" + MAX_LOGIN_ATTEMPTS);
        
        if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
            loggerManager.logSecurityEvent("ACCOUNT_LOCKED", "User", username, 
                "Account locked after " + currentAttempts + " failed attempts");
        }
    }
    
    //Reset failed attempts cho user (dùng khi admin unlock)
    public void resetFailedAttempts(String username) {
        loginAttempts.remove(username);
        lastFailedAttemptTime.remove(username);
        loggerManager.logSecurityEvent("ACCOUNT_UNLOCKED", "User", username, 
            "Failed attempts reset by admin");
    }
    

    public int getFailedAttempts(String username) {
        return loginAttempts.getOrDefault(username, 0);
    }

    public boolean isUserLocked(String username) {
        return isAccountLocked(username);
    }

    public void clearUserCache(String username) {
        userCache.remove(username);
        loggerManager.logSecurityEvent("CACHE_CLEARED", "User", username, 
            "User cache cleared");
    }

    public void clearAllCache() {
        int cacheSize = userCache.size();
        userCache.clear();
        loggerManager.logSecurityEvent("CACHE_CLEARED", "System", "ALL", 
            "All user cache cleared (" + cacheSize + " entries)");
    }
}


