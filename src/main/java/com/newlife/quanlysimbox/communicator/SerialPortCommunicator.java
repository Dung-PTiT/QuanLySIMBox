package com.newlife.quanlysimbox.communicator;

import com.newlife.Contract;
import com.newlife.base.LogUtil;
import com.newlife.base.StringUtil;
import com.newlife.quanlysimbox.model.ConsoleMessage;
import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.base.TimeUtil;
import com.newlife.quanlysimbox.util.VinaUtil;
import gnu.io.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.TooManyListenersException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class SerialPortCommunicator implements SerialPortEventListener {

    public enum SerialPortStatus {
        READING_MESSAGE,
        READING_INFO
    }

    public enum Action {
        START_READMESSAGE,
        DONE_SIMID,
        DONE_NETWORK,
        DONE_CONNECT,
        DONE_SIGNAL,
        DONE_CALL,
        DONE_READMESSAGE,
        DONE_ALLMESSAGE,
        DONE_BALANCE,
        FAIL_READMESSAGE
    }

//    public int CONNECT_TIMEOUT = 2000;
//    public int READ_SIGNAL_TIME = 5;
//    public int PORT_SPEED = 115200;
//    public int MSG_MAX_SIZE = 20;
//    public long SAP_HET_TIEN = 2000;
//    public long SAP_HET_HAN = 5;

    public CommPortIdentifierManager manager;
    public SerialPortStatus status;
    public CommPortIdentifier commPortIdentifier;
    public CommPort commPort;
    public IOSerial ioSerial;
    public SerialPort serialPort;
    public InputStream input = null;
    public OutputStream output = null;
    public boolean isInsertedSim = false;
    public boolean isEnablePort = false;
    public Calendar calendar;
    public SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    public boolean isStop = false;
    public String lastCmd = "";
    public String outString = "";
    public ArrayList<String> messageLineList = new ArrayList<>();
    public SimInfo simInfo = new SimInfo();
    public Date localTime;
    public boolean retryReadMsg = false;
    public String cmtiOutString = "";

    public ExecutorService executor = Executors.newFixedThreadPool(5);


    public SerialPortCommunicator(CommPortIdentifierManager manager, CommPortIdentifier commPortIdentifier) {
        this.commPortIdentifier = commPortIdentifier;
        this.manager = manager;
        this.simInfo.commName = commPortIdentifier.getName();
    }

    public boolean connect() {
        try {
            commPort = commPortIdentifier.open(commPortIdentifier.getName(), manager.appConfig.CONNECT_TIMEOUT);
            serialPort = (gnu.io.SerialPort) commPort;
            serialPort.notifyOnDataAvailable(true);
            serialPort.setSerialPortParams(manager.appConfig.PORT_SPEED, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
            serialPort.addEventListener(this);
            simInfo.isConnected = true;
            return true;
        } catch (PortInUseException e) {
            e.printStackTrace();
        } catch (TooManyListenersException e) {
            e.printStackTrace();
            LogUtil.println(manager.appConfig,"Too many listeners");
        } catch (UnsupportedCommOperationException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean disconnect() {
        if (serialPort == null) {
            return true;
        } else {
            try {
                serialPort.removeEventListener();
                serialPort.close();
                if (input != null) input.close();
                if (output != null) output.close();
                simInfo.isConnected = false;
                return true;
            } catch (Exception e) {
                e.printStackTrace();
            }
            return false;
        }
    }

    public void startTracking() {
        if (isStop) return;
        executor.execute(() -> {
            try {
                status = SerialPortStatus.READING_INFO;
                runCmd(Contract.AT);
                Thread.sleep(1000);
                isStop = false;
                if (outString.equals("OK")) {
                    isEnablePort = true;
                    runCmd(Contract.SIM_ID);
                } else {
                    isEnablePort = false;
                    Thread.sleep(5000);
                    startTracking();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public boolean initIOStream() {
        if (serialPort != null) {
            try {
                input = serialPort.getInputStream();
                output = serialPort.getOutputStream();
                ioSerial = new IOSerial(output, input);
                return true;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return false;
    }

    int countReadSignal = 0;

    public void handleAction(Action action) {
        if (status == SerialPortStatus.READING_MESSAGE) {
            switch (action) {
                case DONE_READMESSAGE:
                    startTracking();
                    break;
                case FAIL_READMESSAGE:
                    if(!cmtiOutString.isEmpty()) {
                        try {
                            Thread.sleep(3000);
                            readNewMessage(cmtiOutString);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    } else {
                        startTracking();
                    }
                    break;
            }
        } else if (status == SerialPortStatus.READING_INFO && !isStop) {
            try {
                switch (action) {
                    case START_READMESSAGE:
                        status = SerialPortStatus.READING_MESSAGE;
                        break;
                    case DONE_CALL:
                        break;
                    case DONE_SIMID:
                        Thread.sleep(1000);
                        runCmd(Contract.NETWORK);
                        break;
                    case DONE_NETWORK:
                        countReadSignal = 0;
                        if(simInfo.consoleMessageList == null || simInfo.consoleMessageList.isEmpty())
                        simInfo.consoleMessageList = manager.consoleMessageRepository.getAllMessageOfSim(simInfo.simId);
                        Thread.sleep(1000);
                        runCmd(Contract.SIGNAL);
//                    runCmd(Contract.BALANCE);
                        break;
                    case DONE_SIGNAL:
                        if (countReadSignal < manager.appConfig.READ_SIGNAL_TIME) {
                            Thread.sleep(5000);
                            countReadSignal += 1;
                            runCmd(Contract.SIGNAL);
                        } else {
                            countReadSignal = 0;
                            checkFullMsgInSim();
                            manager.saveSimInfo(simInfo);
                            startTracking();
                        }
                        break;
                    case DONE_BALANCE:
                        break;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void checkFullMsgInSim() {
        if (simInfo.consoleMessageList != null && simInfo.consoleMessageList.size() > manager.appConfig.MSG_MAX_SIZE) {
            while (simInfo.consoleMessageList.size() > 0) {
                if (!isStop) {
                    try {
                        ConsoleMessage consoleMessage = simInfo.consoleMessageList.get(0);
                        runCmd(Contract.DELETE_MGS + consoleMessage.mgsId);
                        simInfo.consoleMessageList.remove(0);
                        Thread.sleep(400);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                } else {
                    break;
                }
            }
        }
    }

    @Override
    public void serialEvent(SerialPortEvent serialPortEvent) {
        outString = readSerial();
        if (outString.isEmpty() || outString.startsWith("AT") || outString.startsWith("RING")) return;

        LogUtil.println(manager.appConfig,simInfo.commName + " : lastCmd: " + lastCmd);
        LogUtil.println(manager.appConfig,simInfo.commName + " : outString: " + outString);

        if (outString.equals("^SYSSTART")) {
            lastCmd = "";
            executor.execute(() -> {
                try {
                    Thread.sleep(3000);
                    if (!simInfo.commName.isEmpty()) manager.reconnectToComm(simInfo.commName);
                    else {
                        startTracking();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        } else if (outString.startsWith("+CLIP:")) {
            // +CLIP: "0354576363",129,,,,0
            LogUtil.println(manager.appConfig,simInfo.commName + ": -----> Co cuoc goi den");
            try {
                ConsoleMessage consoleMessage = new ConsoleMessage();
                consoleMessage.simId = simInfo.simId;
                consoleMessage.isMessage = false;
                consoleMessage.time = new Date();
                consoleMessage.simTime = consoleMessage.time;
                int start = outString.indexOf("\"");
                int end = outString.lastIndexOf("\"");
                String sdt = outString.substring(start + 1, end);
                consoleMessage.sdtGui = sdt;
                manager.consoleMessageRepository.save(consoleMessage);
            } catch (Exception e) {
                e.printStackTrace();
            }
            writeSerial(Contract.REJECT_CALL);
            handleAction(Action.DONE_CALL);
        } else if (outString.startsWith("+CMTI")) {
            localTime = new Date();
            status = SerialPortStatus.READING_MESSAGE;
            cmtiOutString = outString;
            readNewMessage(cmtiOutString);
        } else if (lastCmd.startsWith(Contract.MESSAGES)) {
            if (!outString.equals("OK") && !outString.startsWith("+COPS") && !outString.startsWith("+CSQ") && !StringUtil.isNumber(outString)) {
                messageLineList.add(outString);
            }
        } else if (lastCmd.equals(Contract.SIGNAL)) {
            if (outString.startsWith("+CSQ")) {
                try {
                    String[] splits = outString.split(":");
                    simInfo.tinHieu = Float.valueOf(splits[1].trim().replaceAll(",", "."));
                    simInfo.time = TimeUtil.getTime();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                handleAction(Action.DONE_SIGNAL);
            }
        } else if (lastCmd.equals(Contract.SIM_ID) && !outString.equals("OK")) {
            if (outString.equals("ERROR")) {
                isInsertedSim = false;
                startTracking();
            } else {
                isInsertedSim = true;
                simInfo.simId = outString;
                simInfo.time = TimeUtil.getTime();
                handleAction(Action.DONE_SIMID);
//                runCmd(Contract.NETWORK);
            }
        } else if (lastCmd.equals(Contract.NETWORK) && !outString.equals("OK")) {
            if (outString.contains("+COPS")) {
                String[] splits = outString.split(",");
                if (splits.length == 3) {
                    String network = splits[2].replaceAll("\"", "");
                    simInfo.nhaMang = network;
                    simInfo.time = TimeUtil.getTime();
//                    runCmd(Contract.BALANCE);
                }
            }
            handleAction(Action.DONE_NETWORK);
//            repeatReadingSimInfo();
        } else if (lastCmd.equals(Contract.BALANCE) && !outString.equals("OK")) {
            if (!outString.equals("ERROR")) {
                if (simInfo.nhaMang.equals("VN VINAPHONE")) {
                    long[] tk = VinaUtil.getBalanceVINA(outString);
                    simInfo.taiKhoanChinh = tk[0];
                    simInfo.taiKhoanPhu = tk[1];
                    simInfo.ngayHetHan = VinaUtil.ngayHetHanVina(outString);
                    simInfo.time = TimeUtil.getTime();
//                    LogUtil.println(manager.appConfig,simInfo.commName + " : taikhoanchinh: " + simInfo.taiKhoanChinh
//                            + ", taikhoanphu: " + simInfo.taiKhoanPhu
//                            + ", ngayhethan: " + simInfo.ngayHetHan);
                } else if (simInfo.nhaMang.equals("")) {

                }
                updateSimAccount();
            }
            handleAction(Action.DONE_BALANCE);
//            repeatReadingSimInfo();
        }
    }

    public void readNewMessage(String outString) {
        if (isStop) return;
        try {
            messageLineList.clear();
            simInfo.lastMsgId = Integer.valueOf(outString.split(",")[1]);
            simInfo.time = TimeUtil.getTime();
            LogUtil.println(manager.appConfig,simInfo.commName + ": ---> new message: " + outString);
            messageLineList.clear();
            runCmd(Contract.TEXT_MODE);
            Thread.sleep(1000);
            runCmd(Contract.MESSAGES + simInfo.lastMsgId);

            executor.execute(() -> {
                try {
                    Thread.sleep(5000);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                parseNewMessages();
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void parseNewMessages() {
        LogUtil.println(manager.appConfig,simInfo.commName + ": ---> parse new messages");
        ConsoleMessage consoleMessage = new ConsoleMessage();
        consoleMessage.mgsId = simInfo.lastMsgId;
        consoleMessage.simId = simInfo.simId;
        consoleMessage.isMessage = true;

        LogUtil.println(manager.appConfig,simInfo.commName + ": list: " + messageLineList);
        int index = 0;
        String line = messageLineList.get(index);
        while (!line.startsWith("+CMGR") && index < messageLineList.size()) {
            index += 1;
            line = messageLineList.get(index);
        }
        if (index == messageLineList.size()) {
            if (retryReadMsg) {
                retryReadMsg = false;
                handleAction(Action.DONE_READMESSAGE);
            } else {
                retryReadMsg = true;
                handleAction(Action.FAIL_READMESSAGE);
            }
        } else {
            line = line.substring(6).trim();
            String[] splits = line.split(",");
            try {
                String type = splits[0].replaceAll("\"", "");
                String sdt = splits[1].replaceAll("\"", "");
                Date time = TimeUtil.parseMgsTime((splits[3] + " " + splits[4]).replaceAll("\"", ""));
//                    Date time = new Date();
                String content = "";
                index += 1;
                while (index < messageLineList.size()) {
                    String nextLine = messageLineList.get(index);
                    content += " " + nextLine;
                    index += 1;
                }
                content = StringUtil.hexStringToText(content.trim());
                LogUtil.println(manager.appConfig,simInfo.lastMsgId + "," + type + "," + sdt + "," + time + "," + content);

                consoleMessage.status = type;
                consoleMessage.sdtGui = sdt.toUpperCase();
                consoleMessage.time = localTime;
                consoleMessage.simTime = time;
                consoleMessage.content = content;

                manager.consoleMessageRepository.save(consoleMessage);
                manager.mapMessage(consoleMessage);
            } catch (Exception e) {
                e.printStackTrace();
            }

            messageLineList.clear();
            simInfo.consoleMessageList = new ArrayList<>(manager.consoleMessageRepository.getAllMessageOfSim(simInfo.simId));

            simInfo.time = TimeUtil.getTime();

            handleAction(Action.DONE_READMESSAGE);
        }
    }

    public void parseAllMessages() {
        LogUtil.println(manager.appConfig,"---> parse messages");
        int index = 0;
        ArrayList<ConsoleMessage> tempList = new ArrayList<>();
        while (index < messageLineList.size()) {
            String line = messageLineList.get(index);
            if (line.startsWith("+CMGL")) {
                line = line.substring(6).trim();
                String[] splits = line.split(",");
                try {
                    int id = Integer.parseInt(splits[0].trim());
                    String type = splits[1].replaceAll("\"", "");
                    String sdt = splits[2].replaceAll("\"", "");
//                    Date time = TimeUtil.parseMgsTime((splits[4] + " " + splits[5]).replaceAll("\"", ""));
                    Date time = new Date();
                    String content = "";
                    index += 1;
                    while (index < messageLineList.size() && !messageLineList.get(index).startsWith("+CMGL")) {
                        String nextLine = messageLineList.get(index);
                        content += " " + nextLine;
                        index += 1;
                    }
                    content = StringUtil.hexStringToText(content.trim());
                    LogUtil.println(manager.appConfig,id + "," + type + "," + sdt + "," + time + "," + content);
                    tempList.add(new ConsoleMessage(id, type, sdt.toUpperCase(), time, content, simInfo.simId));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        messageLineList.clear();
        simInfo.consoleMessageList = tempList;
        if (simInfo.lastMsgId == -1 && !simInfo.consoleMessageList.isEmpty())
            simInfo.lastMsgId = simInfo.consoleMessageList.get(simInfo.consoleMessageList.size() - 1).mgsId;
        simInfo.time = TimeUtil.getTime();
        manager.saveMessages(simInfo.simId, simInfo.consoleMessageList);
        LogUtil.println(manager.appConfig,"size: " + simInfo.consoleMessageList.size());
    }

    public void updateSimAccount() {
        if (simInfo.taiKhoanChinh != -1 && simInfo.taiKhoanPhu != -1) {
            long total = simInfo.taiKhoanChinh + simInfo.taiKhoanPhu;
            if (total == 0) {
                simInfo.isHetTien = true;
                simInfo.isSapHetTien = false;
            } else if (total <= manager.appConfig.SAP_HET_TIEN) {
                simInfo.isHetTien = false;
                simInfo.isSapHetTien = true;
            }
        } else {
            simInfo.isSapHetTien = false;
            simInfo.isHetTien = false;
        }
        if (!simInfo.ngayHetHan.isEmpty()) {
            try {
                Date expDate = dateFormat.parse(simInfo.ngayHetHan);
                Date curentDate = new Date();
                long diffInMillies = Math.abs(expDate.getTime() - curentDate.getTime());
                if (diffInMillies <= 0) {
                    simInfo.isHetHan = true;
                    simInfo.isSapHetHan = false;
                } else {
                    simInfo.isHetHan = false;
                    long diff = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
                    if (diff <= manager.appConfig.SAP_HET_HAN) simInfo.isSapHetHan = true;
                    else simInfo.isSapHetHan = false;
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
        } else {
            simInfo.isSapHetHan = false;
            simInfo.isHetHan = false;
        }
        simInfo.time = TimeUtil.getTime();
    }

    public boolean writeSerial(String data) {
        return ioSerial.writeSerial(data + "\r\n");
    }

    public String readSerial() {
        return ioSerial.readSerial();
    }

    public void runCmd(String cmd) {
        lastCmd = cmd;
        writeSerial(cmd);
    }
}
