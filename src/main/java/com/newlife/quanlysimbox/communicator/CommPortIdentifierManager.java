package com.newlife.quanlysimbox.communicator;

import com.newlife.base.AppConfig;
import com.newlife.base.AppConfigRepository;
import com.newlife.quanlymayao_android.controller.DeviceManager;
import com.newlife.quanlysimbox.model.*;
import com.newlife.quanlysimbox.repository.*;
import gnu.io.CommPortIdentifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CommPortIdentifierManager {

    @Autowired
    MapAppNameReponsitory mapAppNameReponsitory;
    @Autowired
    MappedMessageRepository mappedMessageRepository;
    @Autowired
    RequestMessageReponsitory requestMessageReponsitory;
    @Autowired
    SimInfoRepository simInfoRepository;
    @Autowired
    ConsoleMessageRepository consoleMessageRepository;
    @Autowired
    public AppConfigRepository appConfigRepository;

    public AppConfig appConfig;

    public DeviceManager deviceManager;

    public ArrayList<SerialPortCommunicator> commPortList = findAllCommPort();

    public void loadAppConfig(){
        if(appConfig == null) appConfig = appConfigRepository.findById(1L).orElse( new AppConfig());
    }

    public void connectToSimbox() {
        System.out.println("size: " + commPortList.size());
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
                list.add(new SerialPortCommunicator(this, indIdentifier));
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
                    System.out.println("connect to: " + commName);
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
            System.out.println("disconnect to: " + commName);
        }
        return communicator.simInfo;
    }

    public boolean reconnectToComm(String commName) {
        new Thread(() -> {
            try {
                disConnectToComm(commName);
                Thread.sleep(3000);
                connectToComm(commName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        return true;
    }

    public void saveSimInfo(SimInfo simInfo) {
        new Thread(() -> {
            try {
                SimInfo infoCloned = (SimInfo) simInfo.clone();
                simInfoRepository.save(infoCloned);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public void saveMessages(String simId, ArrayList<ConsoleMessage> consoleMessageList){
        new Thread(() -> {
            consoleMessageRepository.deleteAllMessageOfSim(simId);
            consoleMessageRepository.saveAll(consoleMessageList);
        }).start();
    }

    public void mapMessage(ConsoleMessage consoleMessage){
        new Thread(()->{
            String appName = getAppNameOfMessage(consoleMessage.content);
            RequestMessage requestMessage = requestMessageReponsitory.getRequestMessage(
                    consoleMessage.simId, appName,System.currentTimeMillis()).get(0);
            if(requestMessage!=null && !requestMessage.appName.isEmpty()){
                requestMessage.mapped = true;
                requestMessageReponsitory.updateRequestMessage(requestMessage.id);
                MappedMessage mappedMessage = new MappedMessage(consoleMessage, requestMessage);
                mappedMessageRepository.save(mappedMessage);
            }
        }).start();
    }

    public String getAppNameOfMessage(String content){
        HashMap<String, List<String>> hashMap = new HashMap<>();
        List<MapAppName> mapAppNameList = mapAppNameReponsitory.findAll();
        for(MapAppName mapAppName : mapAppNameList){
            String[] splits = mapAppName.words.split(",");
            hashMap.put(mapAppName.appName, Arrays.asList(splits));
        }

        String[] wordSplits = content.split(" ");
        for(String word : wordSplits){
            for(String key : hashMap.keySet()){
                List<String> wordList = hashMap.get(key);
                if(wordList.contains(word)){
                    return key;
                }
            }
        }
        return "N/A";
    }



}