package com.newlife.quanlysimbox.controller.communicator;

import com.newlife.quanlysimbox.Contract;
import com.newlife.quanlysimbox.model.Messages;
import com.newlife.quanlysimbox.model.SimInfo;
import com.newlife.quanlysimbox.util.VinaUtil;
import gnu.io.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.TooManyListenersException;

public class SerialPortCommunicator extends SimInfo implements SerialPortEventListener {

    public enum SerialPortStatus {
        SLEEPING,
        READING
    }

    public int TIMEOUT = 2000;
    public int SLEEP_TIME = 3000;
    public int READ_SIGNAL_TIME = 3;
    public int PORT_SPEED = 115200;
    public int MGS_MAX_SIZE = 5;

    public SerialPortStatus status;
    public CommPortIdentifier commPortIdentifier;
    public CommPort commPort;
    public IOSerial ioSerial;
    public SerialPort serialPort;
    public InputStream input = null;
    public OutputStream output = null;
    public boolean isInsertedSim = false;
    public boolean isEnablePort = false;

    public boolean isStop = false;
    public boolean isFinishReadMsg = true;
    public String lastCmd = "";
    public String outString = "";
    public ArrayList<String> messageLineList = new ArrayList<>();

    public SerialPortCommunicator(CommPortIdentifier commPortIdentifier) {
        this.commPortIdentifier = commPortIdentifier;
        this.commName = commPortIdentifier.getName();
    }

    public boolean connect() {
        try {
            commPort = commPortIdentifier.open(commPortIdentifier.getName(), TIMEOUT);
            serialPort = (gnu.io.SerialPort) commPort;
            serialPort.notifyOnDataAvailable(true);
            serialPort.setSerialPortParams(PORT_SPEED, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
            serialPort.addEventListener(this);
            isConnected = true;
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
                isConnected = false;
                return true;
            } catch (Exception e) {
                e.printStackTrace();
            }
            return false;
        }
    }

    public void startTracking() {
        new Thread(() -> {
            status = SerialPortStatus.READING;
            runCmd(Contract.AT);
            try {
                Thread.sleep(1000);
                if (outString.equals("OK")) {
                    isEnablePort = true;
                    runCmd(Contract.SIM_ID);
                } else {
                    isEnablePort = false;
                    status = SerialPortStatus.SLEEPING;
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

        if (outString.startsWith("RING")) {
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
            }
            isFinishReadMsg = true;
        } else if (lastCmd.equals(Contract.SIGNAL)) {
            if (outString.startsWith("+CSQ")) {
                try {
                    String[] splits = outString.split(":");
                    tinHieu = Float.valueOf(splits[1].trim().replaceAll(",", "."));
                    System.out.println(commName + " tinhieu: " + tinHieu);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                status = SerialPortStatus.SLEEPING;
            }
        } else if (lastCmd.equals(Contract.SIM_ID) && !outString.equals("OK")) {
            if (outString.equals("ERROR")) {
                isInsertedSim = false;
            } else {
                isInsertedSim = true;
                simId = outString;
                System.out.println(commName + " : sim id : " + simId);
                runCmd(Contract.NETWORK);
            }
        } else if (lastCmd.equals(Contract.NETWORK)) {
            if (outString.contains("+COPS")) {
                String[] splits = outString.split(",");
                if (splits.length == 3) {
                    String network = splits[2].replaceAll("\"", "");
                    nhaMang = network;
                    System.out.println(commName + " : network: " + network);
                    runCmd(Contract.BALANCE);
                }
            }
        } else if (lastCmd.equals(Contract.BALANCE) && !outString.equals("OK")) {
            if (!outString.equals("ERROR")) {
                if (nhaMang.equals("VN VINAPHONE")) {
                    long[] tk = VinaUtil.getBalanceVINA(outString);
                    taiKhoanChinh = tk[0];
                    taiKhoanPhu = tk[1];
                    ngayHetHan = VinaUtil.ngayHetHanVina(outString);
                    System.out.println(commName + " : taikhoanchinh: " + taiKhoanChinh + ", taikhoanphu: " + taiKhoanPhu + ", ngayhethan: " + ngayHetHan);
                } else if (nhaMang.equals("")) {

                }
            }
            repeatReadingSimInfo();
        }
    }

    public void repeatReadingSimInfo(){
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
                    if (messagesList == null) {
                        startUpdateAllMessage();
                    }
                    Thread.sleep(SLEEP_TIME);
                    while (!isFinishReadMsg) {
                        Thread.sleep(200);
                    }
                    if (messagesList!=null && messagesList.size() > MGS_MAX_SIZE) {
                        for (Messages messages : messagesList) {
                            runCmd(Contract.DELETE_MGS + messages.id);
                            Thread.sleep(400);
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
        try {
            lastMsgId = Integer.valueOf(outString.split(",")[1]);
            System.out.println("---> new message: " + outString);
            startUpdateAllMessage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void startUpdateAllMessage() {
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
                    String time = (splits[4] + splits[5]).replaceAll("\"", "");
                    String content = "";
                    index += 1;
                    while (index < messageLineList.size() && !messageLineList.get(index).startsWith("+CMGL")) {
                        String nextLine = messageLineList.get(index);
                        content += nextLine;
                        index += 1;
                    }
                    System.out.println(id + "," + type + "," + sdt + "," + time + "," + content);
                    tempList.add(new Messages(id, type, sdt, time, content));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        messageLineList.clear();
        messagesList = tempList;
        if(lastMsgId==-1 && !messagesList.isEmpty()) lastMsgId = messagesList.get(messagesList.size()-1).id;
        System.out.println("size: " + messagesList.size());
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

    public SimInfo toSimInfo() {
        return this;
    }
}
