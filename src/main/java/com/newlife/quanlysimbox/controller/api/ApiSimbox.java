package com.newlife.quanlysimbox.controller.api;

import com.newlife.quanlysimbox.model.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ApiSimbox {
    @GetMapping("/api/post/getAll")
    public ApiResponse<List<Object>> getAll() {
        List<Object> objectList = new ArrayList<>(); // thay Object
        return new ApiResponse<>(true, objectList);
    }
}
