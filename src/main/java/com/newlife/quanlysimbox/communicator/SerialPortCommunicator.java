package com.newlife.quanlysimbox.communicator;

import com.newlife.quanlysimbox.Contract;
import com.newlife.quanlysimbox.model.Messages;
import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.quanlysimbox.util.TimeUtil;
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
import java.util.concurrent.TimeUnit;

public class SerialPortCommunicator implements SerialPortEventListener {

    public enum SerialPortStatus {
        SLEEPING,
        READING
    }

    public int TIMEOUT = 2000;
    public int SLEEP_TIME = 3000;
    public int READ_SIGNAL_TIME = 5;
    public int PORT_SPEED = 115200;
    public int MGS_MAX_SIZE = 20;
    public long SAP_HET_TIEN = 2000;
    public long SAP_HET_HAN = 5;

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
    public boolean isFinishReadMsg = true;
    public String lastCmd = "";
    public String outString = "";
    public ArrayList<String> messageLineList = new ArrayList<>();
    public SimInfo simInfo = new SimInfo();

    public SerialPortCommunicator(CommPortIdentifierManager manager, CommPortIdentifier commPortIdentifier) {
        this.commPortIdentifier = commPortIdentifier;
        this.manager = manager;
        this.simInfo.commName = commPortIdentifier.getName();
    }

    public boolean connect() {
        try {
            commPort = commPortIdentifier.open(commPortIdentifier.getName(), TIMEOUT);
            serialPort = (gnu.io.SerialPort) commPort;
            serialPort.notifyOnDataAvailable(true);
            serialPort.setSerialPortParams(PORT_SPEED, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
            serialPort.addEventListener(this);
            simInfo.isConnected = true;
            return true;
        } catch (PortInUseException e) {
            e.printStackTrace();
        } catch (TooManyListenersException e) {
            e.printStackTrace();
            System.out.println("Too many listeners");
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
        new Thread(() -> {
            status = SerialPortStatus.READING;
            runCmd(Contract.AT);
            try {
                Thread.sleep(2000);
                isStop = false;
                if (outString.equals("OK")) {
                    isEnablePort = true;
                    runCmd(Contract.SIM_ID);
                } else {
                    isEnablePort = false;
                    status = SerialPortStatus.SLEEPING;
                    Thread.sleep(5000);
                    startTracking();
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
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


    @Override
    public void serialEvent(SerialPortEvent serialPortEvent) {
        outString = readSerial();
        if (outString.isEmpty() || outString.startsWith("AT")) return;

//        System.out.println(outString);
        if (outString.equals("^SYSSTART")) {
            isStop = true;
            lastCmd = "";
            status = SerialPortStatus.SLEEPING;
            new Thread(() -> {
                try {
                    Thread.sleep(3000);
                    System.out.println(manager == null);
                    if (!simInfo.commName.isEmpty()) manager.reconnectToComm(simInfo.commName);
                    else {
                        startTracking();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        } else if (outString.startsWith("RING")) {
            writeSerial(Contract.REJECT_CALL);
        } else if (outString.startsWith("+CMTI")) {
            updateMessageList(outString);
        } else if (lastCmd.equals(Contract.MESSAGES_ALL)) {
            if (outString.equals("ERROR")) {
                lastCmd = "";
                messageLineList.clear();
                System.out.println("error read all messages");
            } else if (outString.equals("OK")) {
                lastCmd = "";
                parseMessages();
            } else {
                messageLineList.add(outString);
                System.out.println(outString);
            }
            isFinishReadMsg = true;
        } else if (lastCmd.equals(Contract.SIGNAL)) {
            if (outString.startsWith("+CSQ")) {
                try {
                    String[] splits = outString.split(":");
                    simInfo.tinHieu = Float.valueOf(splits[1].trim().replaceAll(",", "."));
                    simInfo.time = TimeUtil.getTime();
                    System.out.println(simInfo.commName + " tinhieu: " + simInfo.tinHieu);
                    manager.saveSimInfo(simInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                status = SerialPortStatus.SLEEPING;
            }
        } else if (lastCmd.equals(Contract.SIM_ID) && !outString.equals("OK")) {
            if (outString.equals("ERROR")) {
                isInsertedSim = false;
                startTracking();
            } else {
                isInsertedSim = true;
                simInfo.simId = outString;
                simInfo.time = TimeUtil.getTime();
                System.out.println(simInfo.commName + " : sim id : " + simInfo.simId);
                runCmd(Contract.NETWORK);
            }
        } else if (lastCmd.equals(Contract.NETWORK)) {
            if (outString.contains("+COPS")) {
                String[] splits = outString.split(",");
                if (splits.length == 3) {
                    String network = splits[2].replaceAll("\"", "");
                    simInfo.nhaMang = network;
                    simInfo.time = TimeUtil.getTime();
                    System.out.println(simInfo.commName + " : network: " + network);
                    runCmd(Contract.BALANCE);
//                    repeatReadingSimInfo();
                }
            }
        } else if (lastCmd.equals(Contract.BALANCE) && !outString.equals("OK")) {
            if (!outString.equals("ERROR")) {
                if (simInfo.nhaMang.equals("VN VINAPHONE")) {
                    long[] tk = VinaUtil.getBalanceVINA(outString);
                    simInfo.taiKhoanChinh = tk[0];
                    simInfo.taiKhoanPhu = tk[1];
                    simInfo.ngayHetHan = VinaUtil.ngayHetHanVina(outString);
                    simInfo.time = TimeUtil.getTime();
                    System.out.println(simInfo.commName + " : taikhoanchinh: " + simInfo.taiKhoanChinh
                            + ", taikhoanphu: " + simInfo.taiKhoanPhu
                            + ", ngayhethan: " + simInfo.ngayHetHan);
                } else if (simInfo.nhaMang.equals("")) {

                }
                updateSimAccount();
            }
            repeatReadingSimInfo();
        }
    }

    public void repeatReadingSimInfo() {
        status = SerialPortStatus.SLEEPING;
        lastCmd = "";
        if (!isStop) {
            new Thread(() -> {
                try {
                    for (int i = 0; i < READ_SIGNAL_TIME; i++) {
                        if (!isStop) {
                            status = SerialPortStatus.SLEEPING;
                            Thread.sleep(SLEEP_TIME);
                            while (!isFinishReadMsg) {
                                Thread.sleep(200);
                            }
                            if (!isStop) {
                                status = SerialPortStatus.READING;
                                runCmd(Contract.SIGNAL);
                            }
                        }
                    }
                    if (simInfo.messagesList == null) {
                        startUpdateAllMessage();
                    }
                    Thread.sleep(SLEEP_TIME);
                    while (!isFinishReadMsg) {
                        Thread.sleep(200);
                    }
                    if (simInfo.messagesList != null && simInfo.messagesList.size() > MGS_MAX_SIZE) {
                        for (Messages messages : simInfo.messagesList) {
                            if (!isStop) {
                                runCmd(Contract.DELETE_MGS + messages.mgsId);
                                Thread.sleep(400);
                            }
                        }
                    }
                    if (!isStop) startTracking();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }

    public void updateMessageList(String outString) {
        if (isStop) return;
        try {
            simInfo.lastMsgId = Integer.valueOf(outString.split(",")[1]);
            simInfo.time = TimeUtil.getTime();
            System.out.println("---> new message: " + outString);
            startUpdateAllMessage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void startUpdateAllMessage() {
        if (isStop) return;
        new Thread(() -> {
            try {
                isFinishReadMsg = false;
                while (status != SerialPortStatus.SLEEPING) {
                    Thread.sleep(200);
                }
                System.out.println("start update all message");
                runCmd(Contract.TEXT_MODE);
                Thread.sleep(300);
                runCmd(Contract.MESSAGES_ALL);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public void parseMessages() {
        System.out.println("---> parse messages");
        int index = 0;
        ArrayList<Messages> tempList = new ArrayList<>();
        while (index < messageLineList.size()) {
            String line = messageLineList.get(index);
            if (line.startsWith("+CMGL")) {
                line = line.substring(6).trim();
                String[] splits = line.split(",");
                try {
                    int id = Integer.parseInt(splits[0].trim());
                    String type = splits[1].replaceAll("\"", "");
                    String sdt = splits[2].replaceAll("\"", "");
                    String time = TimeUtil.parseMgsTime((splits[4] + " " + splits[5]).replaceAll("\"", ""));
                    String content = "";
                    index += 1;
                    while (index < messageLineList.size() && !messageLineList.get(index).startsWith("+CMGL")) {
                        String nextLine = messageLineList.get(index);
                        content += nextLine;
                        index += 1;
                    }
                    System.out.println(id + "," + type + "," + sdt + "," + time + "," + content);
                    tempList.add(new Messages(id, type, sdt, time, content, simInfo.simId));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        messageLineList.clear();
        simInfo.messagesList = tempList;
        if (simInfo.lastMsgId == -1 && !simInfo.messagesList.isEmpty())
            simInfo.lastMsgId = simInfo.messagesList.get(simInfo.messagesList.size() - 1).mgsId;
        simInfo.time = TimeUtil.getTime();
        manager.saveMessages(simInfo.messagesList);
        System.out.println("size: " + simInfo.messagesList.size());
    }

    public void updateSimAccount() {
        if (simInfo.taiKhoanChinh != -1 && simInfo.taiKhoanPhu != -1) {
            long total = simInfo.taiKhoanChinh + simInfo.taiKhoanPhu;
            if (total == 0) {
                simInfo.isHetTien = true;
                simInfo.isSapHetTien = false;
            } else if (total <= SAP_HET_TIEN) {
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
                    if (diff <= SAP_HET_HAN) simInfo.isSapHetHan = true;
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
//        System.out.println(cmd);
        lastCmd = cmd;
        writeSerial(cmd);
    }
}
