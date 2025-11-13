package org.example.graduationproject.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResult<T> {
    private boolean success;
    private String message;
    private T data;
    private int status; // HTTP status code suggestion

    public static <T> ServiceResult<T> ok(String message, T data) {
        return new ServiceResult<>(true, message, data, 200);
    }

    public static <T> ServiceResult<T> badRequest(String message) {
        return new ServiceResult<>(false, message, null, 400);
    }

    public static <T> ServiceResult<T> unauthorized(String message) {
        return new ServiceResult<>(false, message, null, 401);
    }

    public static <T> ServiceResult<T> serverError(String message) {
        return new ServiceResult<>(false, message, null, 500);
    }
}







