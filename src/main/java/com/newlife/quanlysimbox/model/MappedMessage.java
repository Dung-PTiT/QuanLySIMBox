package com.newlife.quanlysimbox.model;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Entity
@Data
@Table(name = "mapped_message")
public class MappedMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    @Column(name = "mgs_id")
    public int mgsId;
    public String status;
    public String sdtGui;
    public Date time;
    public String content;
    @Column(name = "sim_id")
    public String simId;
    public boolean isMessage = true;
    public Date simTime;
    public String deviceId;
    public String accountId;
    public String sdtNhan;
    public String appName;
    public Date sendCodeTime;

    public MappedMessage() {
    }

    public MappedMessage(ConsoleMessage consoleMessage, RequestMessage requestMessage) {
        mgsId = consoleMessage.mgsId;
        status = consoleMessage.status;
        sdtGui = consoleMessage.sdtGui;
        time = consoleMessage.time;
        simId = consoleMessage.simId;
        isMessage = consoleMessage.isMessage;
        simTime = consoleMessage.simTime;

        deviceId = requestMessage.deviceId;
        accountId = requestMessage.accountId;
        sdtNhan = requestMessage.sdtNhan;
        appName = requestMessage.appName;
        sendCodeTime = requestMessage.sendCodeTime;
    }
}
