package com.newlife.quanlymayao_android.model;

import lombok.Data;

import java.util.ArrayList;

@Data
public class ManageDeviceResponse {
    public int deviceTotal = 0;
    public int deviceActive = 0;
    public String cpu = "NaN";
    public String ram = "NaN";
    public ArrayList<DeviceStatistic> deviceStatistics = new ArrayList<>();
    public ArrayList<String> messageList = new ArrayList<>();
}
