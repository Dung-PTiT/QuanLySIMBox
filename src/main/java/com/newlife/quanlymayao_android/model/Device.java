package com.newlife.quanlymayao_android.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table
@Data
public class Device implements Serializable {
    @Id
    public int id;
    @Column(name = "nox_id")
    public String noxId;
    @Column(name = "device_id")
    public String deviceId;

    public Device() {
    }
    
    public Device(int id) {
        this.id = id;
        this.noxId = "Nox_"+id;
        int startIndex;
        if(id == 0) startIndex = 0;
        else startIndex = 24;
        this.deviceId = "127.0.0.1:" + (62000 + startIndex + id);
    }
}
