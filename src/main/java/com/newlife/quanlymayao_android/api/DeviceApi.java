package com.newlife.quanlymayao_android.api;

import com.newlife.base.ApiResponse;
import com.newlife.quanlymayao_android.communicator.DeviceManager;
import com.newlife.quanlymayao_android.model.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@RestController
public class DeviceApi {
    @Autowired
    DeviceManager deviceManager;

    @PostMapping(value = "/api/turnon_device")
    public ArrayList<ApiResponse<DeviceStatistic>> turnOnDevice(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (int i = 0; i < deviceIdList.deviceIdList.size(); i++) {
            String deviceId = deviceIdList.deviceIdList.get(i);
            list.add(deviceManager.turnOnDevice(deviceId, (i/5) * 10000));
        }
        return list;
    }

    @PostMapping("/api/turnoff_device")
    public ArrayList<ApiResponse<DeviceStatistic>> turnOffDevice(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.turnOffDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/run_script_device")
    public ArrayList<ApiResponse<DeviceStatistic>> runScriptDevice(@RequestBody RequestScriptList requestList) {
        ArrayList<ApiResponse<DeviceStatistic>> deviceList = new ArrayList<>();
        requestList.list.forEach(request -> {
            deviceList.add(deviceManager.runScript(request.deviceId, request.scriptId, request.accountId));
        });
        return deviceList;
    }

    @PostMapping("/api/stop_script")
    public ArrayList<ApiResponse<DeviceStatistic>> stopScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.stopScriptDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/start_script")
    public ArrayList<ApiResponse<DeviceStatistic>> startScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.startScriptDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/restart_device")
    public ArrayList<ApiResponse<DeviceStatistic>> restartDevice(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.restartDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/manage_device")
    public ManageDeviceResponse getManageDeviceResponse(@RequestParam(name = "deviceId", required = false, defaultValue = "") String deviceId,
                                                        @RequestParam("page") int page,
                                                        @RequestParam("size") int size) {
        return deviceManager.getManageDeviceResponse(deviceId, page, size);
    }

    @PostMapping("/api/add_device")
    public ManageDeviceResponse addDevice(@RequestParam("amount") int amount,
                                          @RequestParam(name = "deviceId", required = false, defaultValue = "") String deviceId,
                                          @RequestParam("page") int page,
                                          @RequestParam("size") int size) {
        int success = 0;
        for (int i = 0; i < amount; i++) {
            Device device = deviceManager.addNewDevice();
            if (device != null) {
                success += 1;
                deviceManager.dvStatusList.add(new DeviceStatus(device));

                for (DeviceStatus deviceStatus : deviceManager.dvStatusList) {
                    try {
                        deviceStatus.time = System.currentTimeMillis();
                        deviceManager.deviceStatusRepository.save(deviceStatus.clone());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        ManageDeviceResponse response = deviceManager.getManageDeviceResponse(deviceId, page, size);
        response.message = "Thêm thành công " + success + ", thất bại " + (amount - success);
        return response;
    }

    @PostMapping("/api/delete_device")
    public ManageDeviceResponse deleteDevice(@RequestBody ManageDeviceList manageDeviceList) {
        int total = manageDeviceList.deviceIdList.size();
        int success = 0;
        for (String id : manageDeviceList.deviceIdList) {
            if (deviceManager.deleteDevice(id)) {
                success += 1;
            }
        }
        ManageDeviceResponse response = deviceManager.getManageDeviceResponse(manageDeviceList.filterDeviceId, manageDeviceList.page, manageDeviceList.size);
        response.message = "Xoá thành công " + success + ", thất bại " + (total - success);
        return response;
    }

    @PostMapping("/api/device_log")
    public ApiResponse<ArrayList<DeviceStatistic>> getDeviceLog(@RequestParam("deviceId") String deviceId) {
        return new ApiResponse<>(true, deviceManager.getDeviceLog(deviceId), "");
    }

    @GetMapping("/api/get_all_script")
    public List<Script> getAllScrip() {
        return deviceManager.scriptReponsitory.findAll();
    }

    @PostMapping("/api/find_account")
    public List<Account> findAccount(@RequestParam(name = "appName") String appName) {
        return deviceManager.accountRepository.findAccountByType(appName);
    }

    @GetMapping("/api/get_summary_statistic")
    public SummaryScriptStatistic getSummaryStatistic(){
        return deviceManager.getSummaryStatistic();
    }


}

@Data
class RequestScript implements Serializable {
    String deviceId;
    Integer scriptId;
    Long accountId;
}

@Data
class RequestScriptList implements Serializable {
    ArrayList<RequestScript> list = new ArrayList<>();
}

@Data
class DeviceIdList implements Serializable {
    ArrayList<String> deviceIdList = new ArrayList<>();
}

@Data
class ManageDeviceList{
    ArrayList<String> deviceIdList = new ArrayList<>();
    String filterDeviceId;
    int page;
    int size;
}
