package com.newlife.quanlysimbox.model;

public class Messages {
    public int id;
    public String status;
    public String sdt;
    public String time;
    public String content;

    public Messages(int id, String status, String sdt, String time, String content) {
        this.id = id;
        this.status = status;
        this.sdt = sdt;
        this.time = time;
        this.content = content;
    }
}
