package com.newlife.quanlymayao_android.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table
public class Device implements Serializable {
    @Id
    @Column(name = "device_id")
    public String deviceId;

    @Column(name = "nox_id")
    public String noxId;

    @Column
    public Integer noxIndex;

    public Device() {
    }
    
    public Device(int noxIndex) {
        this.noxIndex = noxIndex;
        this.noxId = "Nox_"+ noxIndex;
        int startIndex;
        if(noxIndex == 0) startIndex = 0;
        else startIndex = 24;
        this.deviceId = "127.0.0.1:" + (62000 + startIndex + noxIndex);
    }
}
