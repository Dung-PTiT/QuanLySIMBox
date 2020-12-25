package com.newlife.quanlymayao_android.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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

    @Transient
    public ArrayList<RequestScript> requestScriptList;

    @Transient
    public ExecutorService runScriptExecutor = Executors.newFixedThreadPool(5);

    @Column(name = "script_chain_id")
    public int scriptChainId;

    @Transient
    public ScriptChain scriptChain;

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
                code,
                scriptChain,
                requestScriptList
        );
    }

    public void clear() {
        info = "";
        action = "";
        info = "";
        message = "";
        code = "";
        isStarting = false;
        progress = 0;
        runTimes = 0;
        scriptIndex = 0;
    }

    public DeviceStatus clone() throws CloneNotSupportedException {
        return (DeviceStatus) super.clone();
    }

    public boolean hasNextScript() {
        if (requestScriptList != null) {
            return scriptIndex < requestScriptList.size() - 1;
        }
        return false;
    }
}
