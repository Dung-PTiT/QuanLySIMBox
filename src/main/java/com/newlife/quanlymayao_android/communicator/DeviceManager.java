package com.newlife.quanlymayao_android.communicator;

import com.newlife.Contract;
import com.newlife.base.ApiResponse;
import com.newlife.quanlymayao_android.model.*;
import com.newlife.quanlymayao_android.repository.AccountRepository;
import com.newlife.quanlymayao_android.repository.DeviceReponsitory;
import com.newlife.quanlymayao_android.repository.DeviceStatusRepository;
import com.newlife.quanlymayao_android.repository.ScriptReponsitory;
import com.newlife.quanlymayao_android.util.CmdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DeviceManager {
    @Autowired
    DeviceReponsitory deviceReponsitory;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    ScriptReponsitory scriptReponsitory;

    @Autowired
    DeviceStatusRepository deviceStatusRepository;

    public ArrayList<DeviceStatus> dvStatusList;

    public void trackingActiveDevice() {
        new Thread(() -> {
            try {
                loadActiveDevice();
                saveDeviceStatusToDb();
                Thread.sleep(5000);
                trackingActiveDevice();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public void saveDeviceStatusToDb() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                for (DeviceStatus deviceStatus : dvStatusList) {
                    try {
                        deviceStatus.time = System.currentTimeMillis();
                        deviceStatusRepository.save(deviceStatus.clone());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();

    }

    public ArrayList<DeviceStatus> loadDeviceListFromDB() {
        ArrayList<DeviceStatus> statusList = new ArrayList<>();
        List<Device> dvList = deviceReponsitory.findAll();
        dvList.forEach(dv -> statusList.add(new DeviceStatus(dv)));
        return statusList;
    }

    public ArrayList<DeviceStatus> loadDeviceListFromStorage() {
        ArrayList<DeviceStatus> statusList = new ArrayList<>();
        List<Device> dvList = loadAvailableDevice();
        dvList.forEach(dv -> statusList.add(new DeviceStatus(dv)));
        return statusList;
    }

    public void loadActiveDevice() {
        try {
            dvStatusList.forEach(dv -> dv.isActive = false);
            ArrayList<String> output = CmdUtil.runCmd(Contract.NOX_ADB + " devices");
            output.forEach(line -> {
                if (line.startsWith("127.0.0.1:")) {
                    String id = line.replaceAll("device", "").trim();
                    dvStatusList.forEach(dv -> {
                        if (dv.device.deviceId.equals(id)) {
                            dv.isStarting = false;
                            dv.isActive = true;

                            if (dv.script == null) {
                                dv.status = "free";
                            }
                        }
                    });
                }
            });
            dvStatusList.forEach(dv -> {
                System.out.println(dv.device.deviceId + " : " + dv.isActive);
            });
            System.out.println("---------------------");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public ApiResponse<DeviceStatistic> turnOnDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isBusy || deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận");
            } else if (!deviceStatus.isActive) {
                deviceStatus.isStarting = true;
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId;
                System.out.println(cmd);
                CmdUtil.runCmdWithoutOutput(cmd);
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị đã hoạt động");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
    }

    public ApiResponse<DeviceStatistic> turnOffDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isBusy || deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận");
            } else if (deviceStatus.isActive) {
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -quit";
                CmdUtil.runCmdWithoutOutput(cmd);
                deviceStatus.isActive = false;
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
    }

    public ApiResponse<DeviceStatistic> stopScriptDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isBusy || deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận");
            } else if (deviceStatus.isActive) {
                // Todo dừng kịch bản đang chạy
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
    }

    public ApiResponse<DeviceStatistic> startScriptDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isBusy || deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận");
            } else if (deviceStatus.isActive) {
                // Todo tiết tục chạy kịch bản
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
    }

    public DeviceStatus getDeviceStatus(String deviceId) {
        DeviceStatus deviceStatus = null;
        for (DeviceStatus dv : dvStatusList) {
            if (dv.device.deviceId.trim().equals(deviceId)) {
                deviceStatus = dv;
                break;
            }
        }
        return deviceStatus;
    }

    public ApiResponse<DeviceStatistic> runScript(String deviceId, Integer scriptId, Long accountId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus == null) {
            return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
        } else {
            Script script = scriptReponsitory.findById(scriptId).orElse(null);
            Account account = accountRepository.findById(accountId).orElse(null);

            if (script == null || account == null)
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản");
            else if (!script.name.isEmpty() && !account.username.isEmpty()) {
                if (!deviceStatus.isActive) {
                    return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động");
                } else if (deviceStatus.isStarting || deviceStatus.isBusy) {
                    return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện đang bận");
                } else {
                    runScript(deviceStatus, script, account);
                    return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
                }
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản");
            }
        }
    }

    public void runScript(DeviceStatus deviceStatus, Script script, Account account) {
        new Thread(() -> {
            try {
                String cmd = Contract.AUTO_TOOL + " " + script.name + " " + deviceStatus.device.deviceId + " "
                        + account.username + " " + account.password + " " + account.simId;
                ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", cmd);
                builder.directory(new File(Contract.AUTO_TOOL_FOLDER));
                builder.redirectErrorStream(true);
                deviceStatus.status = "running";
                Process p = builder.start();
                BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
                String line;
                while (true) {
                    line = r.readLine();
                    if (line == null) {
                        break;
                    }
                    System.out.println(line);
                    if (line.startsWith("Action:")) {
                        deviceStatus.action = line.substring(7);
                    }
                    if (line.startsWith("Progress:")) {
                        try {
                            deviceStatus.progress = Integer.parseInt(line.substring(9).trim());
                            if (deviceStatus.progress == 100) {
                                deviceStatus.status = "complete";
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    if (line.startsWith("Error:")) {
                        deviceStatus.status = "fail";
                        deviceStatus.info = line.substring(6);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public ApiResponse<DeviceStatistic> restartDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isBusy || deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận");
            } else if (deviceStatus.isActive) {
                CmdUtil.runCmdWithoutOutput(Contract.NOX + " -quit:" + deviceStatus.device.noxId);
                deviceStatus.isActive = false;
                deviceStatus.isStarting = true;
                CmdUtil.runCmdWithoutOutput(Contract.NOX + " -clone:" + deviceStatus.device.noxId);
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                deviceStatus.isStarting = true;
                CmdUtil.runCmdWithoutOutput(Contract.NOX + " -clone:" + deviceStatus.device.noxId);
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị");
    }

    public ArrayList<Device> loadAvailableDevice() {
        ArrayList<Device> deviceList = new ArrayList<>();
        File parentFolder = new File(Contract.NOX_DEVICES);
        System.out.println(parentFolder.getAbsolutePath());
        if (parentFolder.exists()) {
            File[] noxFolders = parentFolder.listFiles();
            for (File folder : noxFolders) {
                String name = folder.getName();
                String id = name.replaceAll("Nox_", "");
                deviceList.add(new Device(Integer.parseInt(id)));
            }
        }
        return deviceList;
    }

    public Device addNewDevice() {
        ArrayList<Device> deviceList = loadAvailableDevice();
        int maxId = 0;
        for (Device device : deviceList) {
            maxId = Math.max(maxId, device.id);
        }
        int newId = maxId + 1;
        Device newDevice = new Device(newId);
        File devicesFolder = new File(Contract.NOX_DEVICES);
        if (devicesFolder.exists()) {
            File noxFolder = new File(Contract.NOX_DEVICES + File.separator + newDevice.noxId);
            if (noxFolder.mkdir()) {
                try {
                    Path source = Paths.get(Contract.NOX_TEMPLATE_FILE);
                    Path destination = Paths.get(noxFolder + File.separator + newDevice.noxId + "-disk2.vmdk");
                    Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
                    deviceList.add(newDevice);
                    deviceReponsitory.saveAll(deviceList);
                    return newDevice;
                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
            } else {
                return null;
            }
        }
        return null;
    }

    public boolean deleteDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            File noxFolder = new File(Contract.NOX_DEVICES + File.separator + deviceStatus.device.noxId);
            boolean deleteSuccess = true;
            if (noxFolder.exists()) {
                deleteSuccess = noxFolder.delete();
            }
            if (deleteSuccess) dvStatusList.remove(deviceStatus);
            return deleteSuccess;
        } else
            return false;
    }

    public ArrayList<DeviceStatistic> getAllDeviceStatusStatistic() {
        ArrayList<DeviceStatus> deviceStatuses = deviceStatusRepository.findAllDeviceStatusLast(System.currentTimeMillis());
        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
        deviceStatuses.forEach(status -> {
            statisticList.add(status.toStatistic());
        });
        return statisticList;
    }

    // Todo Khởi động lại thiết bị
    // Todo Xóa thiết bị
    // Todo Thêm thiết bị

    // Todo Tìm kiếm thiết bị
    // Todo Xem log thiết bị

    // Todo Lấy thông tin CPU, RAM đang sử dụng
    // Todo mirror thiết bị
    // Todo quản lý tài khoản
    // Todo quản lý các máy ảo
    // Todo Quản lý kịch bản
}
