package com.newlife.quanlymayao_android.model;

import lombok.Data;

import java.util.ArrayList;

@Data
public class ManageDeviceList {
    public ArrayList<String> deviceIdList = new ArrayList<>();
    public String filterDeviceId;
    public int page;
    public int size;
}