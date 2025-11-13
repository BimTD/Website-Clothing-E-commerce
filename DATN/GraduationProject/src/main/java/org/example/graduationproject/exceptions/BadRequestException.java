package org.example.graduationproject.exceptions;
//400 request không hợp lệ
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}







