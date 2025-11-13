package org.example.graduationproject.exceptions;

/**
 * Exception khi tài khoản bị khóa do quá nhiều lần đăng nhập sai
 */
public class AccountLockedException extends RuntimeException {
    
    public AccountLockedException(String message) {
        super(message);
    }
    
    public AccountLockedException(String message, Throwable cause) {
        super(message, cause);
    }
}



