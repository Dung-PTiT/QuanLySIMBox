package com.newlife.quanlysimbox;

import com.newlife.quanlysimbox.controller.communicator.CommPortIdentifierManager;
import com.newlife.quanlysimbox.controller.communicator.SerialPortCommunicator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QuanlysimboxApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuanlysimboxApplication.class, args);


    }

}
