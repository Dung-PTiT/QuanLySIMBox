package com.newlife.quanlymayao_android.model;

import com.newlife.Contract;

public class DeviceStatistic {

    public DeviceStatistic() {
    }

    public DeviceStatistic(String deviceId, String status, long time, int index, boolean isActive,
                           String account, String app, String action, int progress, String info, String script,
                           String simId, boolean isStarting, String message, String code) {
        this.deviceId = deviceId;
        this.status = status;
        this.time = time;
        this.index = index;
        this.isActive = isActive;
        this.account = account;
        this.app = app;
        this.action = action;
        this.progress = progress;
        this.script = script;
        this.simId = simId;
        this.info = info;
        this.isStarting = isStarting;
        this.message = message;
        this.code = code;

        switch (this.app){
            case "Facebook":
                this.appIcon = Contract.FACEBOOK_ICON;
                break;
            case "Zalo":
                this.appIcon = Contract.ZALO_ICON;
                break;
            case "Youtube":
                this.appIcon = Contract.YOUTUBE_ICON;
                break;
            case "Skype":
                this.appIcon = Contract.SKYPE_ICON;
                break;
            case "Line":
                this.appIcon = Contract.LINE_ICON;
                break;
            case "Viper":
                this.appIcon = Contract.VIPER_ICON;
                break;
            case "Whatsapp":
                this.appIcon = Contract.WHATSAPP_ICON;
                break;
        }
    }

    public String deviceId;
    public String status;
    public long time;
    public int index;
    public boolean isActive;
    public String account;
    public String app;
    public String appIcon="";
    public String action;
    public String info;
    public int progress;
    public String script;
    public String simId;
    public boolean isStarting;
    public String message = "";
    public String code;
}
