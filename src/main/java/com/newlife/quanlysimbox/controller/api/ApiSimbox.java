package com.newlife.quanlysimbox.controller.api;

import com.newlife.quanlysimbox.controller.communicator.CommPortIdentifierManager;
import com.newlife.quanlysimbox.model.ApiResponse;
import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.quanlysimbox.model.SimStatistic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
public class ApiSimbox {

    @Autowired
    CommPortIdentifierManager manager;

    @GetMapping("/api/getSimStatistic")
    public ApiResponse<SimStatistic> getSimStatistic() {
        return new ApiResponse<>(true, manager.getSimStatistic());
    }

    @PostMapping(path = "/api/connect")
    public ApiResponse<SimInfo> connectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.connectToComm(commName));
    }

    @PostMapping(path = "/api/disconnect")
    public ApiResponse<SimInfo> disconnectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.disConnectToComm(commName));
    }

    @PostMapping(path = "/api/reconnect")
    public ApiResponse<Boolean> reconnectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.reconnectToComm(commName));
    }
}
