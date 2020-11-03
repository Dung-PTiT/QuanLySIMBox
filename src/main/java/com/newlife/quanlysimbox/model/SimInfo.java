package com.newlife.quanlysimbox.model;

import java.util.ArrayList;

public class SimInfo {

    public String commName;
    public String simId = "";
    public String nhaMang = "";
    public long taiKhoanChinh = 0;
    public long taiKhoanPhu = 0;
    public String ngayHetHan = "";
    public Float tinHieu = 0f;
    public int lastMsgId = -1;
    public ArrayList<Messages> messagesList = null;
    public String deviceCode = "";
    public boolean isConnected = false;

}
