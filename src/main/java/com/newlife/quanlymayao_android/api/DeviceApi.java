package com.newlife.quanlymayao_android.api;

import com.newlife.base.ApiResponse;
import com.newlife.quanlymayao_android.controller.DeviceManager;
import com.newlife.quanlymayao_android.model.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class DeviceApi {
    @Autowired
    DeviceManager deviceManager;

    @PostMapping(value = "/api/turnon_device")
    public ArrayList<ApiResponse<DeviceStatistic>> turnOnDevice(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (int i = 0; i < deviceIdList.deviceIdList.size(); i++) {
            String deviceId = deviceIdList.deviceIdList.get(i);
            list.add(deviceManager.turnOnDevice(deviceId, (i / 5) * 10000));
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

    @PostMapping("/api/get_device_statistic")
    public ApiResponse<DeviceStatistic> getDeviceStatistic(@RequestParam("deviceId") String deviceId) {
        DeviceStatus deviceStatus = null;
        for (DeviceStatus dv : deviceManager.dvStatusList) {
            if (dv.device.deviceId.equals(deviceId)) {
                deviceStatus = dv;
                break;
            }
        }
        if (deviceStatus == null) {
            return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
        } else {
            return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
        }
    }

    @PostMapping("/api/run_script_device")
    public ArrayList<ApiResponse<DeviceStatistic>> runScriptDevice(@RequestBody RequestScriptChain requestScriptChain) {
        ArrayList<ApiResponse<DeviceStatistic>> statisticList = new ArrayList<>();
        Map<String, ArrayList<RequestScript>> map = new HashMap<>();
        requestScriptChain.requestScriptList.forEach(request -> {
            if (!map.containsKey(request.deviceId)) {
                map.put(request.deviceId, new ArrayList<>());
            }
            map.get(request.deviceId).add(request);
        });

        for (String deviceId : map.keySet()) {
            DeviceStatus deviceStatus = deviceManager.getDeviceStatus(deviceId);
            if (deviceStatus == null) {
                statisticList.add(new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")"));
            } else if (deviceStatus.status.equals("sleeping") || deviceStatus.status.equals("wait")) {
                statisticList.add(new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị đang đợi.\nHãy hũy đợi trước khi chạy."));
            } else if (deviceStatus.status.equals("finished") || deviceStatus.status.equals("free") || !deviceStatus.isActive) {
                if (requestScriptChain.scriptChainId == 0) {
                    deviceStatus.scriptChain = null;
                    deviceStatus.scriptChainId = 0;
                    deviceStatus.requestScriptList = map.get(deviceId);
                    deviceStatus.scriptIndex = 0;
                    deviceStatus.repeatTime = requestScriptChain.repeatTime;
                    if (!deviceStatus.isActive) deviceStatus.runScriptAfterBoot = true;
                    statisticList.add(deviceManager.runScript(deviceStatus.device.deviceId));
                } else {
                    ScriptChain scriptChain = deviceManager.scriptChainRepository.findById(requestScriptChain.scriptChainId).orElse(null);
                    if (scriptChain == null) {
                        statisticList.add(new ApiResponse<>(false, deviceStatus.toStatistic(), "Không tìm thấy chuỗi kịch bản (" + deviceId + ")"));
                    } else {
                        scriptChain.scriptList = deviceManager.getScriptListOfScriptChain(scriptChain);
                        deviceStatus.scriptChain = scriptChain;
                        deviceStatus.scriptChainId = scriptChain.id;
                        deviceStatus.requestScriptList = map.get(deviceId);
                        deviceStatus.scriptIndex = 0;
                        deviceStatus.repeatTime = requestScriptChain.repeatTime;
                        if (!deviceStatus.isActive) deviceStatus.runScriptAfterBoot = true;
                        statisticList.add(deviceManager.runScript(deviceStatus.device.deviceId));
                    }
                }
            } else {
                statisticList.add(new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị đang chạy kịch bản khác.\nHãy kết thúc nó và chạy lại."));
            }
        }
        return statisticList;
    }

    @PostMapping("/api/cancel_sleep")
    public ArrayList<ApiResponse<DeviceStatistic>> cancelStop(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.cancelSleep(deviceId));
        }
        return list;
    }

    @PostMapping("/api/stop_script")
    public ArrayList<ApiResponse<DeviceStatistic>> stopScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.stopScriptDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/finish_script")
    public ArrayList<ApiResponse<DeviceStatistic>> finishScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.finishScriptDevice(deviceId));
        }
        return list;
    }

    @PostMapping("/api/remove_out_queue")
    public ArrayList<ApiResponse<DeviceStatistic>> removeOutQueue(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.removeOutQueue(deviceId));
        }
        return list;
    }

    @PostMapping("/api/start_script")
    public ArrayList<ApiResponse<DeviceStatistic>> startScript(@RequestBody DeviceIdList deviceIdList) {
        ArrayList<ApiResponse<DeviceStatistic>> list = new ArrayList<>();
        for (String deviceId : deviceIdList.deviceIdList) {
            list.add(deviceManager.runScript(deviceId));
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

    @GetMapping("/api/get_all_script_chain")
    public List<ScriptChain> getAllScripChain() {
        List<ScriptChain> scriptChains = deviceManager.scriptChainRepository.findAll();
        for (int i = 0; i < scriptChains.size(); i++) {
            scriptChains.get(i).scriptList = getScriptList(scriptChains.get(i).strScriptIds);
        }
        return scriptChains;
    }

    @PostMapping("/api/get_script_chain")
    public ApiResponse<ScriptChain> getScriptChain(@RequestParam("scriptChainId") int scriptChainId) {
        ScriptChain scriptChain = deviceManager.scriptChainRepository.findById(scriptChainId).orElse(null);
        if (scriptChain == null)
            return new ApiResponse<>(false, new ScriptChain(), "Không tìm thấy chuỗi kịch bản: " + scriptChainId);
        else
            scriptChain.scriptList = getScriptList(scriptChain.strScriptIds);
        return new ApiResponse<>(true, scriptChain, "");
    }

    @PostMapping("/api/delete_script_chain")
    public ApiResponse<ScriptChain> deleteScriptChain(@RequestParam("scriptChainId") int scriptChainId) {
        deviceManager.scriptChainRepository.deleteById(scriptChainId);
        return new ApiResponse<>(true, null, "");
    }

    @PostMapping("/api/update_script_chain")
    public ApiResponse<Void> updateScriptChain(@RequestBody ScriptChain scriptChain) {
        int count = deviceManager.scriptChainRepository.update(scriptChain.name, scriptChain.strScriptIds, scriptChain.id);
        if (count != 1) {
            return new ApiResponse<>(false, null, "Lưu chuỗi kích bản thất bại");
        } else {
            return new ApiResponse<>(true, null, "Lưu chuỗi kích bản thành công");
        }
    }

    @PostMapping("/api/add_script_chain")
    public ApiResponse<Void> addScriptChain(@RequestBody ScriptChain scriptChain) {
        ScriptChain newSC = deviceManager.scriptChainRepository.save(scriptChain);
        if (newSC.id == 0) {
            return new ApiResponse<>(false, null, "Lưu chuỗi kích bản thất bại");
        } else {
            return new ApiResponse<>(true, null, "Lưu chuỗi kích bản thành công");
        }
    }

    public ArrayList<Script> getScriptList(String strScriptIds) {
        ArrayList<Script> scriptList = new ArrayList<>();
        String[] splits = strScriptIds.split(",");
        for (int i = 0; i < splits.length; i++) {
            try {
                if (splits[i].isEmpty()) continue;
                int id = Integer.parseInt(splits[i]);
                Script script = deviceManager.scriptReponsitory.findById(id).orElse(null);
                if (script != null) scriptList.add(script);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return scriptList;
    }

    @PostMapping("/api/find_account")
    public List<Account> findAccount(@RequestParam(name = "appName") String appName) {
        return deviceManager.accountRepository.findAccountByType(appName);
    }

    @GetMapping("/api/get_summary_statistic")
    public SummaryScriptStatistic getSummaryStatistic() {
        return deviceManager.getSummaryStatistic();
    }

    @PostMapping("/api/get_run_script_times_info")
    public ApiResponse<List<RunScriptTimesInfo>> getRunScriptTimesInfo(@RequestParam(name = "startTime") String startTime,
                                                                       @RequestParam(name = "endTime") String endTime) {
        List<RunScriptTimesInfo> list = deviceManager.getRunScriptTimesInfo(startTime, endTime);
        if (list == null) {
            return new ApiResponse<>(false, new ArrayList<>(), "Định dạng thời gian lỗi");
        } else {
            return new ApiResponse<>(true, list, "");
        }
    }

    @PostMapping("/api/get_last_run_script_times_info")
    public ApiResponse<List<RunScriptTimesInfo>> getLastRunScriptTimesInfo(@RequestParam(name = "startTime") String startTime,
                                                                           @RequestParam(name = "endTime") String endTime) {
        List<RunScriptTimesInfo> list = deviceManager.getLastRunScriptTimesInfo(startTime, endTime);
        if (list == null) {
            return new ApiResponse<>(false, new ArrayList<>(), "Định dạng thời gian lỗi");
        } else {
            return new ApiResponse<>(true, list, "");
        }
    }

    @PostMapping("/api/get_fail_run_script_times_info")
    public ApiResponse<List<RunScriptTimesInfo>> getFailRunScriptTimesInfo(@RequestParam(name = "startTime") String startTime,
                                                                           @RequestParam(name = "endTime") String endTime) {
        List<RunScriptTimesInfo> list = deviceManager.getFailRunScriptTimesInfo(startTime, endTime);
        if (list == null) {
            return new ApiResponse<>(false, new ArrayList<>(), "Định dạng thời gian lỗi");
        } else {
            return new ApiResponse<>(true, list, "");
        }
    }

    @PostMapping("/api/get_kichban_lanchay")
    public ApiResponse<List<KichBan_LanChay>> getKichBanLanChay(@RequestParam(name = "startTime") String startTime,
                                                                @RequestParam(name = "endTime") String endTime) {
        List<KichBan_LanChay> list = deviceManager.getKichBanLanChay(startTime, endTime);
        if (list == null) {
            return new ApiResponse<>(false, new ArrayList<>(), "Địch dạng thời gian lỗi");
        } else {
            return new ApiResponse<>(true, list, "");
        }
    }
}

@Data
class RequestScriptChain implements Serializable {
    public ArrayList<RequestScript> requestScriptList;
    public int scriptChainId;
    public long repeatTime;
}
