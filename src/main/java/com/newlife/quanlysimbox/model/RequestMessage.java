package com.newlife.quanlysimbox.model;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "request_message")
public class RequestMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    @Column(name = "mgs_id")
    public String deviceId;
    public String accountId;
    public String sdtNhan;
    public String appName = "";
    public Date sendCodeTime;
    public String simId;
    public boolean mapped;
}
