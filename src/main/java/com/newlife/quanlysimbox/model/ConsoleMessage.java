package com.newlife.quanlysimbox.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "console_message")
@Data
public class ConsoleMessage implements Serializable {
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

    public ConsoleMessage(int mgsId, String status, String sdtGui, Date time, String content, String simId) {
        this.mgsId = mgsId;
        this.status = status;
        this.sdtGui = sdtGui;
        this.time = time;
        this.content = content;
        this.simId = simId;
    }

    public ConsoleMessage() {

    }

}
