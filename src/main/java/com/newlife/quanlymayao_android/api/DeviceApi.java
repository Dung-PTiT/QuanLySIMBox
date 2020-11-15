package com.newlife.quanlymayao_android.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.newlife.base.ApiResponse;
import com.newlife.quanlymayao_android.communicator.DeviceManager;
import com.newlife.quanlymayao_android.model.Device;
import com.newlife.quanlymayao_android.model.DeviceStatistic;
import com.newlife.quanlymayao_android.model.DeviceStatus;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
public class DeviceApi {
    @Autowired
    DeviceManager deviceManager;

    @PostMapping("/api/turnon_device")
    public ApiResponse<DeviceStatistic> turnOnDevice(@RequestParam("deviceId") String deviceId) {
        return deviceManager.turnOnDevice(deviceId);
    }

    @PostMapping("/api/turnoff_device")
    public ApiResponse<DeviceStatistic> turnOffDevice(@RequestParam("deviceId") String deviceId) {
        return deviceManager.turnOffDevice(deviceId);
    }

    @PostMapping(value = "/api/run_script_one_device", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<DeviceStatistic> runScriptOneDevice(@RequestBody RequestScript requestScript) {
        return deviceManager.runScript(requestScript.deviceId, requestScript.scriptId, requestScript.accountId);
    }

    @PostMapping("/api/run_script_multi_device")
    public ArrayList<ApiResponse<DeviceStatistic>> runScriptMultiDevice(@RequestBody RequestScriptList requestList) {
        ArrayList<ApiResponse<DeviceStatistic>> deviceList = new ArrayList<>();
        requestList.list.forEach(request -> {
            deviceList.add(deviceManager.runScript(request.deviceId, request.scriptId, request.accountId));
        });
        return deviceList;
    }

    @PostMapping("/api/stop_script")
    public ApiResponse<DeviceStatistic> stopScript(@RequestParam("deviceId") String deviceId) {
        return deviceManager.stopScriptDevice(deviceId);
    }

    @PostMapping("/api/stop_multi_script")
    public ArrayList<ApiResponse<DeviceStatistic>> stopMultiScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> deviceList = new ArrayList<>();
        deviceIdList.deviceIdList.forEach(deviceId->{
            deviceList.add(deviceManager.stopScriptDevice(deviceId));
        });
        return deviceList;
    }

    @PostMapping("/api/start_script")
    public ApiResponse<DeviceStatistic> startScript(@RequestParam("deviceId") String deviceId) {
        return deviceManager.startScriptDevice(deviceId);
    }

    @PostMapping("/api/start_multi_script")
    public ArrayList<ApiResponse<DeviceStatistic>> startMultiScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> deviceList = new ArrayList<>();
        deviceIdList.deviceIdList.forEach(deviceId->{
            deviceList.add(deviceManager.startScriptDevice(deviceId));
        });
        return deviceList;
    }

    @PostMapping("/api/restart_device")
    public ApiResponse<DeviceStatistic> restartDevice(@RequestParam("deviceId") String deviceId) {
        return deviceManager.restartDevice(deviceId);
    }

    @GetMapping("/api/get_all_status_device_last")
    public ApiResponse<ArrayList<DeviceStatistic>> getAllStatusDeviceLast(){
        return new ApiResponse<>(true, deviceManager.getAllDeviceStatusStatistic(), "");
    }

    @PostMapping("/api/add_device")
    public ApiResponse<ArrayList<DeviceStatistic>> addDevice(@RequestParam("amount") int amount) {
        int success = 0;
        for (int i = 0; i < amount; i++) {
            Device device = deviceManager.addNewDevice();
            if(device!=null) {
                success += 1;
                deviceManager.dvStatusList.add(new DeviceStatus(device));
            }
        }
        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
        deviceManager.dvStatusList.forEach(status ->{
            statisticList.add(status.toStatistic());
        });
        return new ApiResponse<>(true, statisticList, "Thêm thành công " + success + ", thất bại " + (amount - success));
    }

    @PostMapping("/api/delete_device")
    public ApiResponse<ArrayList<DeviceStatistic>> deleteDevice(@RequestBody DeviceIdList deviceIdList){
        int total = deviceIdList.deviceIdList.size();
        int success = 0;
        for (String deviceId : deviceIdList.deviceIdList){
            if(deviceManager.deleteDevice(deviceId)){
                success += 1;
            }
        }
        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
        deviceManager.dvStatusList.forEach(status ->{
            statisticList.add(status.toStatistic());
        });
        return new ApiResponse<>(true, statisticList, "Xoá thành công " + success + ", thất bại " + (total - success));
    }



}

class RequestScript {
    String deviceId;
    Integer scriptId;
    Long accountId;
}

class RequestScriptList {
    ArrayList<RequestScript> list = new ArrayList<>();
}

class DeviceIdList {
    ArrayList<String> deviceIdList = new ArrayList<>();
}
