package com.newlife.quanlymayao_android.communicator;

import com.newlife.Contract;
import com.newlife.base.ApiResponse;
import com.newlife.base.SystemUtil;
import com.newlife.base.TimeUtil;
import com.newlife.quanlymayao_android.model.*;
import com.newlife.quanlymayao_android.model.RunScriptDuration;
import com.newlife.quanlymayao_android.repository.*;
import com.newlife.quanlymayao_android.util.CmdUtil;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
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

    @PersistenceContext
    public EntityManager entityManager;

    public ScriptStatisticDao scriptStatisticDao = new ScriptStatisticDao();
    public ArrayList<DeviceStatus> dvStatusList;
    private boolean justStop = false;

    public void trackingActiveDevice() {
        new Thread(() -> {
            try {
                if (justStop) {
                    Thread.sleep(Contract.SAVE_DEVICE_STATUS_TIME);
                    justStop = false;
                }
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

    public ApiResponse<DeviceStatistic> turnOnDevice(String deviceId, long delay) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            if (deviceStatus.isStarting) {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Thiết bị bận (" + deviceId + ")");
            } else if (!deviceStatus.isActive) {
                new Thread(() -> {
                    try {
                        Thread.sleep(delay);
                        String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -resolution:720x1280 -performance:middle -root:false";
                        CmdUtil.runCmdWithoutOutput(cmd);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).start();
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
                if (deviceStatus.account != null) {
                    deviceStatus.account.status = "free";
                    accountRepository.save(deviceStatus.account);
                }
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -quit";
                CmdUtil.runCmdWithoutOutput(cmd);

                String processId = CmdUtil.getProcessIdOfNox(deviceStatus.device.noxId);
                if (!processId.isEmpty()) {
                    CmdUtil.killNoxVMHandle(processId);
                }
                justStop = true;
                deviceStatus.isActive = false;
                deviceStatus.runTimes = 0;
                deviceStatus.clear();
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
                    Account currentAcc = accountRepository.findById(deviceStatus.account.id).orElse(null);
                    if (currentAcc == null || currentAcc.status.equals("using")) {
                        return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản.\nTài khoản đang được sử dụnng bởi thiết bị khác");
                    } else {
                        runScript(deviceStatus, deviceStatus.script, deviceStatus.account, true);
                        return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
                    }
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
                    runScript(deviceStatus, script, account, true);
                    return new ApiResponse<>(true, deviceStatus.toStatistic(), "");
                }
            } else {
                return new ApiResponse<>(false, deviceStatus.toStatistic(), "Không thể chạy kịch bản (" + deviceId + ")");
            }
        }
    }

    public void runScript(DeviceStatus deviceStatus, Script script, Account account, boolean isFirstTime) {
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
            deviceStatus.message = "";
            deviceStatus.code = "";
            account.status = "using";
            long maxRunTimes = deviceStatusRepository.getMaxScriptRunTimes();
            deviceStatus.runTimes = maxRunTimes + 1;
            saveDeviceStatusToDb();
            accountRepository.save(account);
            new Thread(() -> {
                try {
                    Process process = builder.start();
                    BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()));
                    String line;
                    while (true) {
                        boolean hasChange = false;
                        line = r.readLine();
                        if (line == null) {
                            break;
                        }
                        System.out.println(line);
                        if (line.startsWith("Action:")) {
                            hasChange = true;
                            deviceStatus.action = line.substring(7).trim();
                        }
                        if (line.startsWith("Progress:")) {
                            try {
                                deviceStatus.progress = Integer.parseInt(line.substring(9).trim());
                                if (deviceStatus.progress == 100) {
                                    deviceStatus.status = "complete";
                                    deviceStatus.account.status = "free";
                                    accountRepository.save(account);
                                    hasChange = true;
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                        if (line.startsWith("Message:")) {
                            deviceStatus.message = line.substring(8).trim();
                            hasChange = true;
                        }
                        if (line.startsWith("Code:")) {
                            deviceStatus.code = line.substring(5).trim();
                            hasChange = true;
                        }
                        if (line.startsWith("Error:")) {
                            deviceStatus.status = "fail";
                            deviceStatus.info = line.substring(6).trim();
                            if (deviceStatus.account != null) {
                                deviceStatus.account.status = "free";
                                accountRepository.save(deviceStatus.account);
                            }

                            if(isFirstTime) {
                                retryRunScript(deviceStatus, script, account);
                            }
                            hasChange = true;
                        }
                        // error: device '127.0.0.1:62025' not found
                        if (line.startsWith("error: device") && line.endsWith("not found")) {
                            String[] splits = line.split("'");
                            String deviceId = splits[1];
                            if (deviceId.startsWith("127")) {
                                stopScriptDevice(deviceId);
                                turnOffDevice(deviceId);
                            }
                        }
                        if (hasChange) saveDeviceStatusToDb();
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

    public void retryRunScript(DeviceStatus deviceStatus, Script script, Account account){
        new Thread(()->{
            try {
                deviceStatus.action = "Wait to retry";
                Thread.sleep(11000);
                runScript(deviceStatus, script, account, false);
            }catch (Exception e){
                e.printStackTrace();
            }
        }).start();
    }

    public ApiResponse<DeviceStatistic> restartDevice(String deviceId) {
        DeviceStatus deviceStatus = getDeviceStatus(deviceId);
        if (deviceStatus != null) {
            deviceStatus.info = "";
            deviceStatus.message = "";
            deviceStatus.code = "";
            if (deviceStatus.isActive) {
                String cmd = Contract.NOX + " -clone:" + deviceStatus.device.noxId + " -quit";
                CmdUtil.runCmdWithoutOutput(cmd);
                deviceStatus.isActive = false;
                deviceStatus.isStarting = true;
                if (deviceStatus.account != null) {
                    deviceStatus.account.status = "free";
                    accountRepository.save(deviceStatus.account);
                }
                deviceStatus.clear();
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
//            deviceReponsitory.delete(deviceStatus.device);
            if (deleteSuccess) {
                try {
                    deviceStatus.time = System.currentTimeMillis();
                    deviceStatus.isDeleted = true;
                    if (deviceStatus.account != null) {
                        deviceStatus.account.status = "free";
                        accountRepository.save(deviceStatus.account);
                    }
                    dvStatusList.remove(deviceStatus);
                    deviceStatus.runTimes = 0;
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

    public SummaryScriptStatistic getSummaryStatistic(){
        SummaryScriptStatistic summaryScriptStatistic = new SummaryScriptStatistic();
        summaryScriptStatistic.totalRunTimes = scriptStatisticDao.countRunScriptTimes("");
        summaryScriptStatistic.successRunTimes = scriptStatisticDao.countRunScriptTimes("complete");
        summaryScriptStatistic.failRunTimes = scriptStatisticDao.countRunScriptTimes("fail");

        long countDate = 0;
        long endDate = 0;
        ArrayList<RunScriptDuration> listScriptDuration = scriptStatisticDao.getRunScriptDurationList();
        for(RunScriptDuration duration : listScriptDuration){
            if(duration.begin > endDate){
                countDate += 1;
                endDate = TimeUtil.getEndTimeOfDate(duration.begin);
            }
        }
//        System.out.println(countDate);
        summaryScriptStatistic.avg = summaryScriptStatistic.totalRunTimes/countDate;
        return summaryScriptStatistic;
    }

    public ArrayList<RunScriptTimesInfo> getRunScriptTimesInfo(String startTimeStr, String endTimeStr){
        long[] times = TimeUtil.parseTimeString(startTimeStr, endTimeStr);
        if(times==null){
            return null;
        } else {
            return scriptStatisticDao.getRunScriptTimesInfo(times[0], times[1]);
        }
    }

    public List<KichBan_LanChay> getKichBanLanChay(String startTimeStr, String endTimeStr){
        long[] times = TimeUtil.parseTimeString(startTimeStr, endTimeStr);
        if(times==null){
            return null;
        } else {
            return scriptStatisticDao.getKichBanLanChayList(times[0], times[1]);
        }
    }

    public List<RunScriptTimesInfo> getLastRunScriptTimesInfo(String startTimeStr, String endTimeStr){
        long[] times = TimeUtil.parseTimeString(startTimeStr, endTimeStr);
        if(times==null){
            return null;
        } else {
            return scriptStatisticDao.getLastRunScriptTimesInfo(times[0], times[1]);
        }
    }




    // Todo mirror thiết bị
    // Todo quản lý tài khoản
    // Todo quản lý các máy ảo
    // Todo Quản lý kịch bản
}
