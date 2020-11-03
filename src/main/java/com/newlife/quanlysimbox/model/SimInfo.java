package com.newlife.quanlysimbox.model;

import java.util.ArrayList;

public class SimInfo {

    public String commName = "";
    public String simId = "";
    public String nhaMang = "";
    public long taiKhoanChinh = -1;
    public long taiKhoanPhu = -1;
    public String ngayHetHan = "";
    public Float tinHieu = 0f;
    public int lastMsgId = -1;
    public ArrayList<Messages> messagesList = null;
    public String deviceCode = "";
    public boolean isConnected = false;

    public boolean isSapHetTien = false;
    public boolean isHetTien = false;
    public boolean isSapHetHan = false;
    public boolean isHetHan = false;
}
