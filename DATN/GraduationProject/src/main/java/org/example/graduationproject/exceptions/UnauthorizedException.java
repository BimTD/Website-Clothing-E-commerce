package org.example.graduationproject.exceptions;

//401 không có quyền
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}







