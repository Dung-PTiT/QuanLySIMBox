package com.newlife.quanlymayao_android.model;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "device_status")
public class DeviceStatus implements Serializable, Cloneable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public long id;

    public long time;
    public String status = "";
    public String info = "";
    public String action = "";
    public int progress = 0;

    @Column(name = "is_active")
    public boolean isActive;
    @Column(name = "is_starting")
    public boolean isStarting;
    @Column(name = "is_busy")
    public boolean isBusy;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "nox_id")
    public Device device;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id")
    public Account account;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "script_id")
    public Script script;

    public DeviceStatus() {
    }

    public DeviceStatus(Device device) {
        this.device = device;
    }

    public DeviceStatistic toStatistic() {
        return new DeviceStatistic(
                device.deviceId,
                status,
                time,
                isActive,
                account == null ? "" : account.username,
                account == null ? "" : account.app,
                action,
                progress,
                info,
                script == null ? "" : script.name,
                account == null ? "" : account.simId,
                isBusy
        );
    }

    public DeviceStatus clone() throws CloneNotSupportedException {
        return (DeviceStatus) super.clone();
    }
}
