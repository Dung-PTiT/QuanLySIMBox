package com.newlife.quanlymayao_android.model;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "device_status")
public class DeviceStatus implements Serializable, Cloneable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public long time;
    public String status = "";
    public String info = "";
    public String action = "";
    public int progress = 0;
    public String message = "";
    public String code = "";

    @Column(name = "is_active")
    public boolean isActive;
    @Column(name = "is_starting")
    public boolean isStarting;
    @Column(name = "is_deleted")
    public boolean isDeleted = false;
    @Column(name = "run_times")
    public long runTimes;

    @Column(name = "script_index")
    public int scriptIndex = 0;

    @Column(name = "finish")
    public Boolean finish = true;

    @Transient
    public RequestScriptList requestScriptList;

    @ManyToOne
    @JoinColumn(name = "device_id")
    public Device device;

    @ManyToOne
    @JoinColumn(name = "account_id")
    public Account account;

    @ManyToOne
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
                device.noxIndex,
                isActive,
                account == null ? "" : account.username,
                account == null ? "" : script.app,
                action,
                progress,
                info,
                script == null ? "" : script.name,
                account == null ? "" : account.simId,
                isStarting,
                message,
                code
        );
    }

    public void clear(){
        status = "";
        info = "";
        action = "";
        info = "";
        message = "";
        code = "";
        isStarting = false;
        progress = 0;
        account = null;
        script = null;
        runTimes = 0;
        scriptIndex = 0;
        finish = true;
        requestScriptList = null;
    }

    public DeviceStatus clone() throws CloneNotSupportedException {
        return (DeviceStatus) super.clone();
    }

    public boolean hasNextScript(){
        if(requestScriptList!=null){
            if (scriptIndex >= requestScriptList.list.size()-1){
                return false;
            } else {
                scriptIndex += 1;
                return true;
            }
        }
        return false;
    }
}
