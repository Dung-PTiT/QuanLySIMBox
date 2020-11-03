package com.newlife.quanlysimbox.controller.communicator;

import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.quanlysimbox.model.SimStatistic;
import gnu.io.CommPortIdentifier;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Enumeration;

@Service
public class CommPortIdentifierManager {

    public ArrayList<SerialPortCommunicator> commPortList = findAllCommPort();

    public void connectToSimbox() {
        commPortList.forEach(comm -> {
            if (comm.connect()) {
                if (comm.initIOStream()) {
                    comm.startTracking();
                }
            }
        });
    }

    public ArrayList<SerialPortCommunicator> findAllCommPort() {
        Enumeration ports = CommPortIdentifier.getPortIdentifiers();
        ArrayList<SerialPortCommunicator> list = new ArrayList<>();
        while (ports.hasMoreElements()) {
            CommPortIdentifier indIdentifier = (CommPortIdentifier) ports.nextElement();
            if (indIdentifier.getPortType() == CommPortIdentifier.PORT_SERIAL) {
                list.add(new SerialPortCommunicator(indIdentifier));
            }
        }
        return list;
    }

    public SerialPortCommunicator getCommPortByCommName(String name) {
        for (int i = 0; i < commPortList.size(); i++) {
            if (commPortList.get(i).simInfo.commName.equals(name)) {
                return commPortList.get(i);
            }
        }
        return null;
    }

    public SimStatistic getSimStatistic() {
        ArrayList<SimInfo> list = new ArrayList<>();
        for (SerialPortCommunicator communicator : commPortList) {
            if (communicator.isEnablePort && communicator.isInsertedSim) {
                list.add(communicator.simInfo);
            }
        }
        SimStatistic simStatistic = new SimStatistic();
        simStatistic.simInfoList = list;
        int simDangHoatDong = 0;
        int kheTrong = 0;
        int sapHetTien = 0;
        int hetTien = 0;
        int sapHetHan = 0;
        int hetHan = 0;
        for (SerialPortCommunicator communicator : commPortList) {
            if (communicator.isEnablePort && communicator.isInsertedSim) {
                simDangHoatDong += 1;
                if (communicator.simInfo.isSapHetTien) sapHetTien += 1;
                if (communicator.simInfo.isHetTien) hetTien += 1;
                if (communicator.simInfo.isSapHetHan) sapHetHan += 1;
                if (communicator.simInfo.isHetHan) hetHan += 1;
            }
        }
        kheTrong = commPortList.size() - simDangHoatDong;
        simStatistic.simDangHoatDong = simDangHoatDong;
        simStatistic.kheTrong = kheTrong;
        simStatistic.simSapHetTien = sapHetTien;
        simStatistic.simHetTien = hetTien;
        simStatistic.simSapHetHan = sapHetHan;
        simStatistic.simHetHan = hetHan;
        return simStatistic;
    }

    public int countTotalPortInsertedSim() {
        return commPortList.size() - countEmptySimSlot();
    }

    public int countEmptySimSlot() {
        int count = 0;
        for (SerialPortCommunicator communicator : commPortList) {
            if (!communicator.isInsertedSim) {
                count += 1;
            }
        }
        return count;
    }

    public int countEnablePort() {
        int count = 0;
        for (SerialPortCommunicator communicator : commPortList) {
            if (communicator.isEnablePort) {
                count += 1;
            }
        }
        return count;
    }

    public SimInfo connectToComm(String commName) {
        SerialPortCommunicator communicator = getCommPortByCommName(commName);
        if (communicator != null && !communicator.simInfo.isConnected) {
            if (communicator.connect()) {
                if (communicator.initIOStream()) {
                    communicator.isStop = false;
                    communicator.startTracking();
                }
            }
        }
        return communicator.simInfo;
    }

    public SimInfo disConnectToComm(String commName) {
        SerialPortCommunicator communicator = getCommPortByCommName(commName);
        if (communicator != null && communicator.simInfo.isConnected) {
            communicator.isStop = true;
            communicator.disconnect();
        }
        return communicator.simInfo;
    }

    public void reconnectToComm(String commName) {
        new Thread(() -> {
            try {
                disConnectToComm(commName);
                Thread.sleep(3000);
                connectToComm(commName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

}