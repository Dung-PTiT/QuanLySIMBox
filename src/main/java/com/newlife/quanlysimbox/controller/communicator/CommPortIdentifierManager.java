package com.newlife.quanlysimbox.controller.communicator;

import com.newlife.quanlysimbox.model.SimInfo;
import gnu.io.CommPortIdentifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Enumeration;

@Service
public class CommPortIdentifierManager {

    public ArrayList<SerialPortCommunicator> commPortList = findAllCommPort();

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
            if (commPortList.get(i).commName.equals(name)) {
                return commPortList.get(i);
            }
        }
        return null;
    }

    public ArrayList<SimInfo> getAllSimInfo(){
        ArrayList<SimInfo> list = new ArrayList<>();
        for (SerialPortCommunicator communicator : commPortList) {
            if(communicator.isEnablePort && communicator.isInsertedSim){
                list.add(communicator.toSimInfo());
            }
        }
        return list;
    }

    public int countTotalPortInsertedSim(){
        return commPortList.size() - countEmptySimSlot();
    }

    public int countEmptySimSlot(){
        int count = 0;
        for (SerialPortCommunicator communicator : commPortList) {
            if(!communicator.isInsertedSim){
                count+=1;
            }
        }
        return count;
    }

    public int countEnablePort(){
        int count = 0;
        for (SerialPortCommunicator communicator : commPortList) {
            if(communicator.isEnablePort){
                count+=1;
            }
        }
        return count;
    }

    public void connectToComm(String commName){
        SerialPortCommunicator communicator = getCommPortByCommName(commName);
        if(communicator != null) {
            if (communicator.connect()) {
                if (communicator.initIOStream()) {
                    communicator.isStop = false;
                    communicator.startTracking();
                }
            }
        }
    }

    public void disConnectToComm(String commName){
        SerialPortCommunicator communicator = getCommPortByCommName(commName);
        if(communicator != null) {
            communicator.isStop = true;
            communicator.disconnect();
        }
    }

    public void reconnectToComm(String commName){
        new Thread(() -> {
            try {
                disConnectToComm(commName);
                Thread.sleep(5000);
                connectToComm(commName);
            }catch (Exception e){
                e.printStackTrace();
            }
        }).start();
    }
}
