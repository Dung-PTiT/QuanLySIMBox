package com.newlife.quanlymayao_android.model;

import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;

@Data
public class DeviceIdList implements Serializable {
    public ArrayList<String> deviceIdList = new ArrayList<>();
}