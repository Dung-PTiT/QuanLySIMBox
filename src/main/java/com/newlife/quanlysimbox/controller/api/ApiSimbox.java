package com.newlife.quanlysimbox.controller.api;

import com.newlife.quanlysimbox.controller.communicator.CommPortIdentifierManager;
import com.newlife.quanlysimbox.model.ApiResponse;
import com.newlife.quanlysimbox.model.SimInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ApiSimbox {

    @Autowired
    CommPortIdentifierManager manager;

    @GetMapping("/api/getAllSim")
    public ApiResponse<ArrayList<SimInfo>> getAllSim() {
        return new ApiResponse<>(true, manager.getAllSimInfo());
    }
}
