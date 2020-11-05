package com.newlife.quanlysimbox.api;

import com.newlife.quanlysimbox.communicator.CommPortIdentifierManager;
import com.newlife.quanlysimbox.model.ApiResponse;
import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.quanlysimbox.model.SimStatistic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ApiSimbox {

    @Autowired
    CommPortIdentifierManager manager;

    // lấy tất cả dữ liệu tổng quan, ds sim
    @GetMapping("/api/getSimStatistic")
    public ApiResponse<SimStatistic> getSimStatistic() {
        return new ApiResponse<>(true, manager.getSimStatistic());
    }

    // gọi connect theo cổng comm
    @PostMapping("/api/connect")
    public ApiResponse<SimInfo> connectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.connectToComm(commName));
    }

    @PostMapping("/api/disconnect")
    public ApiResponse<SimInfo> disconnectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.disConnectToComm(commName));
    }

    // mở lại kết nối
    @PostMapping("/api/reconnect")
    public ApiResponse<Boolean> reconnectToComm(@RequestParam("commName") String commName) {
        return new ApiResponse<>(true, manager.reconnectToComm(commName));
    }
}
