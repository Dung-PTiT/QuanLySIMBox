package com.newlife.base;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(value = JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private Boolean success;
    private T data;
    private String error;

    public ApiResponse() {
    }

    public ApiResponse(Boolean success, T data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }
}
