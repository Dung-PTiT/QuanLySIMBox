package com.newlife.quanlymayao_android.communicator;

import com.newlife.Contract;
import com.newlife.base.ApiResponse;
import com.newlife.base.SystemUtil;
import com.newlife.quanlymayao_android.model.*;
import com.newlife.quanlymayao_android.repository.AccountRepository;
import com.newlife.quanlymayao_android.repository.DeviceReponsitory;
import com.newlife.quanlymayao_android.repository.DeviceStatusRepository;
import com.newlife.quanlymayao_android.repository.ScriptReponsitory;
import com.newlife.quanlymayao_android.util.CmdUtil;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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

@Service
public class DeviceManager {
    @Autowired
    DeviceReponsitory deviceReponsitory;

    @Autowired
    public AccountRepository accountRepository;

    @Autowired
    public ScriptReponsitory scriptReponsitory;

    @Autowired
    public DeviceStatusRepository deviceStatusRepository;

    public ArrayList<DeviceStatus> dvStatusList;

    public void trackingActiveDevice() {
        new Thread(() -> {
            try {
                loadActiveDevice();
                saveDeviceStatusToDb();
                Thread.sleep(Contract.SAVE_DEVICE_STATUS_TIME);
                trackingActiveDevice();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public void saveDeviceStatusToDb() {
        new Thread(() -> {
            for (DeviceStatus deviceStatus : dvStatusList) {
                try {
                    deviceStatus.time = System.currentTimeMillis();
                    deviceStatusRepository.save(deviceStatus.clone());
                } catch (Exception e) {
                    e.printStackTrace();
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
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (!deviceStatus.isActive) {
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -resolution:720x1280 -performance:middle -root:false";
                CmdUtil.runCmdWithoutOutput(cmd);
                deviceStatus.isStarting = true;
                saveDeviceStatusToDb();
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị đang hoạt động (" + deviceId + ")");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
    }

    public ApiResponse<DeviceStatistic> turnOffDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (deviceStatus.isActive) {
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -quit";
                CmdUtil.runCmdWithoutOutput(cmd);
                deviceStatus.isActive = false;
                deviceStatus.clear();
                if (deviceStatus.account != null) {
                    deviceStatus.account.status = "free";
                    accountRepository.save(deviceStatus.account);
                }
                saveDeviceStatusToDb();
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động (" + deviceId + ")");
            }
        } else {
            return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
        }
    }

    public ApiResponse<DeviceStatistic> stopScriptDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (deviceStatus.isActive) {
                deviceStatus.status = "stopped";
                if (deviceStatus.account != null) {
                    deviceStatus.account.status = "free";
                    accountRepository.save(deviceStatus.account);
                }
                saveDeviceStatusToDb();
                exitApp(deviceStatus);
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động (" + deviceId + ")");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
    }

    public ApiResponse<DeviceStatistic> startScriptDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (deviceStatus.isActive) {
                if (deviceStatus.script == null || deviceStatus.account == null) {
                    return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản (" + deviceId + ")");
                } else {
                    runScript(deviceStatus, deviceStatus.script, deviceStatus.account);
                    return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
                }
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động (" + deviceId + ")");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
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
            return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
        } else {
            Script script = scriptReponsitory.findById(scriptId).orElse(null);
            Account account = accountRepository.findById(accountId).orElse(null);

            if (script == null || account == null)
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản (" + deviceId + ")");
            else if (!script.name.isEmpty() && !account.username.isEmpty()) {
                if (!deviceStatus.isActive) {
                    return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện không hoạt động (" + deviceId + ")");
                } else if (deviceStatus.isStarting) {
                    return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị hiện đang bận (" + deviceId + ")");
                } else {
                    runScript(deviceStatus, script, account);
                    return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
                }
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản (" + deviceId + ")");
            }
        }
    }

    public void runScript(DeviceStatus deviceStatus, Script script, Account account) {
        try {
            String cmd = Contract.AUTO_TOOL + " " + script.name + " " + deviceStatus.device.deviceId + " "
                    + account.username + " " + account.password + " " + account.simId + " " + deviceStatus.device.noxId;
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", cmd);
            builder.directory(new File(Contract.AUTO_TOOL_FOLDER));
            builder.redirectErrorStream(true);
            deviceStatus.status = "running";
            deviceStatus.isActive = true;
            deviceStatus.isStarting = false;
            deviceStatus.script = script;
            deviceStatus.account = account;
            deviceStatus.progress = 0;
            deviceStatus.info = "";
            account.status = "using";
            saveDeviceStatusToDb();
            accountRepository.save(account);
            new Thread(() -> {
                try {
                    Process process = builder.start();
                    BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()));
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
                                    deviceStatus.account.status = "free";
                                    accountRepository.save(account);
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
        } catch (Exception e) {
            e.printStackTrace();
            deviceStatus.status = "fail";
            deviceStatus.info = e.getMessage();
            saveDeviceStatusToDb();
        }
    }

    public ApiResponse<DeviceStatistic> restartDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (deviceStatus.isActive) {
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -quit";
                CmdUtil.runCmdWithoutOutput(cmd);
                deviceStatus.isActive = false;
                deviceStatus.isStarting = true;
                deviceStatus.clear();
                if (deviceStatus.account != null) {
                    deviceStatus.account.status = "free";
                    accountRepository.save(deviceStatus.account);
                }
                saveDeviceStatusToDb();
                new Thread(() -> {
                    try {
                        Thread.sleep(5000);
                        deviceStatus.isStarting = true;
                        saveDeviceStatusToDb();
                        CmdUtil.runCmdWithoutOutput(Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -resolution:720x1280 -performance:middle -root:false");
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).start();
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            } else {
                deviceStatus.isStarting = true;
                saveDeviceStatusToDb();
                CmdUtil.runCmdWithoutOutput(Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -resolution:720x1280 -performance:middle -root:false");
                return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
            }
        } else return new ApiResponse<>(false, new DeviceStatistic(), "Không tìm thấy thiết bị (" + deviceId + ")");
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

    synchronized public Device addNewDevice() {
        ArrayList<Device> deviceList = loadAvailableDevice();
        int maxId = 0;
        for (Device device : deviceList) {
            maxId = Math.max(maxId, device.noxIndex);
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
                try {
                    deleteSuccess = false;
                    FileUtils.deleteDirectory(noxFolder);
                    deleteSuccess = true;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            if (deleteSuccess) {
                try {
                    deviceStatus.time = System.currentTimeMillis();
                    deviceStatus.isDeleted = true;
                    if (deviceStatus.account != null) {
                        deviceStatus.account.status = "free";
                        accountRepository.save(deviceStatus.account);
                    }
                    dvStatusList.remove(deviceStatus);
                    deviceStatusRepository.save(deviceStatus.clone());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return deleteSuccess;
        } else
            return false;
    }

    public ArrayList<DeviceStatistic> getDeviceStatusStatistic(String deviceId, int page, int size) {
        ArrayList<DeviceStatus> deviceStatuses = deviceStatusRepository
                .findDeviceStatusLast(System.currentTimeMillis(), Contract.READ_DEVICE_STATUS_TIME, deviceId, PageRequest.of(page, size));
        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
        deviceStatuses.forEach(status -> {
            statisticList.add(status.toStatistic());
        });
        return statisticList;
    }

    public ArrayList<DeviceStatistic> getDeviceLog(String deviceId) {
        ArrayList<DeviceStatus> deviceStatuses = deviceStatusRepository
                .getLogDivice(PageRequest.of(0, 100), deviceId);
        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
        deviceStatuses.forEach(status -> {
            statisticList.add(status.toStatistic());
        });
        return statisticList;
    }

//    public ArrayList<DeviceStatistic> getCurrentDeviceStatistics(){
//        ArrayList<DeviceStatistic> statisticList = new ArrayList<>();
//        dvStatusList.forEach(status -> {
//            statisticList.add(status.toStatistic());
//        });
//        return statisticList;
//    }

    public ManageDeviceResponse getManageDeviceResponse(String deviceId, int page, int size) {
        ManageDeviceResponse response = new ManageDeviceResponse();
        response.deviceTotal = dvStatusList.size();
        int count = 0;
        for (DeviceStatus deviceStatus : dvStatusList) if (deviceStatus.isActive) count += 1;
        response.deviceActive = count;
        response.deviceStatistics = getDeviceStatusStatistic(deviceId, page, size);
        response.cpu = SystemUtil.getProcessCpuUsed();
        response.ram = SystemUtil.getMemoryUsed();
        return response;
    }

    public void exitApp(DeviceStatus deviceStatus) {
        try {
            String cmd = Contract.AUTO_TOOL + " Exit " + deviceStatus.device.deviceId;
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", cmd);
            builder.directory(new File(Contract.AUTO_TOOL_FOLDER));
            builder.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Todo Lấy thông tin CPU, RAM đang sử dụng
    // Todo mirror thiết bị
    // Todo quản lý tài khoản
    // Todo quản lý các máy ảo
    // Todo Quản lý kịch bản
}
