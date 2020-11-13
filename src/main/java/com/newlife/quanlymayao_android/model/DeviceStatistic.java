package com.newlife.quanlymayao_android.model;

public class DeviceStatistic {

    public DeviceStatistic() {
    }

    public DeviceStatistic(String deviceId, String status, long time, boolean isActive, String account, String app, String action, int progress, String info, String kichBan,
                           String simId, boolean isBusy) {
        this.deviceId = deviceId;
        this.status = status;
        this.time = time;
        this.isActive = isActive;
        this.account = account;
        this.app = app;
        this.action = action;
        this.progress = progress;
        this.kichBan = kichBan;
        this.simId = simId;
        this.isBusy = isBusy;
        this.info = info;
    }

    public String deviceId;
    public String status;
    public long time;
    public boolean isActive;
    public String account;
    public String app;
    public String action;
    public String info;
    public int progress;
    public String kichBan;
    public String simId;
    public boolean isBusy;
}
