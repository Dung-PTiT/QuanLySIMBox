package com.newlife.base;

import javax.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "app_config")
public class AppConfig implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;

    public int CONNECT_TIMEOUT; // 2000;
    public int READ_SIGNAL_TIME; // 5;
    public int PORT_SPEED; // 115200;
    public int MSG_MAX_SIZE; // 20;
    public long SAP_HET_TIEN; // 2000;
    public long SAP_HET_HAN; // 5;

    public int MAX_DEVICE_QUEUE; // 1;
    public long RUN_SCRIPT_TIME_OUT; // 1500000;
    public boolean SHOW_LOG;
    public int TURN_OFF_TIME_LIMIT; // = 5; minute


    public AppConfig() {
        CONNECT_TIMEOUT = 2000;
        READ_SIGNAL_TIME = 5;
        PORT_SPEED = 115200;
        MSG_MAX_SIZE = 20;
        SAP_HET_TIEN = 2000;
        SAP_HET_HAN = 5;

        MAX_DEVICE_QUEUE = 1;
        RUN_SCRIPT_TIME_OUT = 1500000;
        SHOW_LOG = true;
        TURN_OFF_TIME_LIMIT = 5; // minute
    }

}
