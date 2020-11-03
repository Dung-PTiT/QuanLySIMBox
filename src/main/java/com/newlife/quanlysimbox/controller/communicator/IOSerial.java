package com.newlife.quanlysimbox.controller.communicator;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class IOSerial {
    byte[] portBuffer = new byte[1024];
    OutputStream outputStream;
    InputStream inputStream;

    public IOSerial(OutputStream outputStream, InputStream inputStream) {
        this.outputStream = outputStream;
        this.inputStream = inputStream;
    }

    public boolean writeSerial(String message) {
        try {
            outputStream.write(message.getBytes());
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public String readSerial() {
        String outString = "";
        try {
            int len = 0;
            int data;
            while ((data = inputStream.read()) > -1) {
                portBuffer[len++] = (byte) data;
                if (data == 10) {
                    break;
                }
            }
            outString = new String(portBuffer, 0, len).trim();
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        return outString;
    }
}
