package com.newlife.quanlysimbox.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "messages")
@Data
public class Messages implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    @Column(name = "mgs_id")
    public int mgsId;
    public String status;
    public String sdt;
    public Date time;
    public String content;
    @Column(name = "sim_id")
    public String simId;

    public Messages(int mgsId, String status, String sdt, Date time, String content, String simId) {
        this.mgsId = mgsId;
        this.status = status;
        this.sdt = sdt;
        this.time = time;
        this.content = content;
        this.simId = simId;
    }
}
