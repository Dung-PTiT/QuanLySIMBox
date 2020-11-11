package com.newlife.quanlysimbox.model.simbox;

import jdk.nashorn.internal.ir.annotations.Ignore;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;

@Entity
@Table(name = "sim_info")
public class SimInfo implements Serializable, Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "comm_name")
    public String commName = "";

    @Column(name = "sim_id")
    public String simId = "";

    @Column(name = "nha_mang")
    public String nhaMang = "";

    @Column(name = "tkc")
    public long taiKhoanChinh = -1;

    @Column(name = "tkp")
    public long taiKhoanPhu = -1;

    @Column(name = "ngay_het_han")
    public String ngayHetHan = "";

    @Column(name = "tin_hieu")
    public Float tinHieu = 0f;

    @Column(name = "last_mgs_id")
    public int lastMsgId = -1;

    @Column(name = "time")
    public String time;

    @Column(name = "is_connected")
    public boolean isConnected = false;

    @Column(name = "device_id")
    public String deviceId = "";

    @Transient
    public ArrayList<Messages> messagesList = null;
    @Transient
    public boolean isSapHetTien = false;
    @Transient
    public boolean isHetTien = false;
    @Transient
    public boolean isSapHetHan = false;
    @Transient
    public boolean isHetHan = false;

    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
