package com.newlife.quanlysimbox.communicator;

import com.newlife.Contract;
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

public class SerialPortCommunicator_old implements SerialPortEventListener {

    public enum SerialPortStatus {
        SLEEPING,
        READING
    }

//    public int TIMEOUT = 2000;
//    public int SLEEP_TIME = 3000;
//    public int READ_SIGNAL_TIME = 5;
//    public int PORT_SPEED = 115200;
//    public int MGS_MAX_SIZE = 20;
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
    public boolean isFinishReadMsg = true;
    public String lastCmd = "";
    public String outString = "";
    public ArrayList<String> messageLineList = new ArrayList<>();
    public SimInfo simInfo = new SimInfo();
    public int countReadAllMessageError = 0;
    public int MaxReadAllMessageError = 3;
    public Date localTime;

    public ExecutorService executor = Executors.newFixedThreadPool(5);


    public SerialPortCommunicator_old(CommPortIdentifierManager manager, CommPortIdentifier commPortIdentifier) {
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
        executor.execute(() -> {
            try {
                while (!isFinishReadMsg) {
                    System.out.println(simInfo.commName + ": wait finish read new message on startTracking()");
                    System.out.println(simInfo.commName + ": lineList: " + messageLineList);

                    status = SerialPortStatus.SLEEPING;
                    Thread.sleep(200);
                }

                status = SerialPortStatus.READING;
                runCmd(Contract.AT);
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


    @Override
    public void serialEvent(SerialPortEvent serialPortEvent) {
        outString = readSerial();
        if (outString.isEmpty() || outString.startsWith("AT")) return;

        System.out.println(simInfo.commName + " : lastCmd: " + lastCmd);
        System.out.println(simInfo.commName + " : outString: " + outString);

//        System.out.println(lastCmd + ":" + outString);
        if (outString.equals("^SYSSTART")) {
//            isStop = true;
            lastCmd = "";
            status = SerialPortStatus.SLEEPING;
            executor.execute(() -> {
                try {
                    Thread.sleep(3000);
//                    System.out.println(manager == null);
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
            System.out.println(simInfo.commName + ": -----> Co cuoc goi den");
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
        } else if (outString.startsWith("+CMTI")) {
            localTime = new Date();
            readNewMessage(outString);
        } else if (lastCmd.startsWith(Contract.MESSAGES)) {
            if (outString.equals("OK")) {
                parseNewMessages();
            } else {
                messageLineList.add(outString);
            }
        } else if (lastCmd.equals(Contract.MESSAGES_ALL)) {
//            System.out.println("read all message: " + outString);
            if (outString.trim().equalsIgnoreCase("ERROR")) {
                lastCmd = "";
                messageLineList.clear();
                System.out.println("error read all messages");
                if (countReadAllMessageError < MaxReadAllMessageError) {
                    countReadAllMessageError += 1;
                    startGetAllMessageFromSim();
                } else {
                    countReadAllMessageError = 0;
                    isFinishReadMsg = true;
                }
            } else if (outString.equals("OK")) {
                lastCmd = "";
                parseAllMessages();
            } else {
                messageLineList.add(outString);
//                System.out.println(outString);
            }
        } else if (lastCmd.equals(Contract.SIGNAL)) {
            if (outString.startsWith("+CSQ")) {
                try {
                    String[] splits = outString.split(":");
                    simInfo.tinHieu = Float.valueOf(splits[1].trim().replaceAll(",", "."));
                    simInfo.time = TimeUtil.getTime();
//                    System.out.println(simInfo.commName + " tinhieu: " + simInfo.tinHieu);
//                    manager.saveSimInfo(simInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                status = SerialPortStatus.SLEEPING;
            }
        } else if (lastCmd.equals(Contract.SIM_ID) && !outString.equals("OK")) {
            if (outString.equals("ERROR")) {
                isInsertedSim = false;
                startTracking();
            } else {
                isInsertedSim = true;
                simInfo.simId = outString;
                simInfo.time = TimeUtil.getTime();
//                System.out.println(simInfo.commName + " : sim id : " + simInfo.simId);
                runCmd(Contract.NETWORK);
            }
        } else if (lastCmd.equals(Contract.NETWORK) && !outString.equals("OK")) {
            if (outString.contains("+COPS")) {
                String[] splits = outString.split(",");
                if (splits.length == 3) {
                    String network = splits[2].replaceAll("\"", "");
                    simInfo.nhaMang = network;
                    simInfo.time = TimeUtil.getTime();
//                    System.out.println(simInfo.commName + " : network: " + network);
//                    runCmd(Contract.BALANCE);
                }
            }
            repeatReadingSimInfo();
        } else if (lastCmd.equals(Contract.BALANCE) && !outString.equals("OK")) {
            if (!outString.equals("ERROR")) {
                if (simInfo.nhaMang.equals("VN VINAPHONE")) {
                    long[] tk = VinaUtil.getBalanceVINA(outString);
                    simInfo.taiKhoanChinh = tk[0];
                    simInfo.taiKhoanPhu = tk[1];
                    simInfo.ngayHetHan = VinaUtil.ngayHetHanVina(outString);
                    simInfo.time = TimeUtil.getTime();
//                    System.out.println(simInfo.commName + " : taikhoanchinh: " + simInfo.taiKhoanChinh
//                            + ", taikhoanphu: " + simInfo.taiKhoanPhu
//                            + ", ngayhethan: " + simInfo.ngayHetHan);
                } else if (simInfo.nhaMang.equals("")) {

                }
                updateSimAccount();
            }
//            repeatReadingSimInfo();
        }
    }

    public void repeatReadingSimInfo() {
        lastCmd = "";
        if (!isStop) {
            executor.execute(() -> {
                try {
                    if (simInfo.consoleMessageList == null || simInfo.consoleMessageList.isEmpty()) {
                        simInfo.consoleMessageList = new ArrayList<>(manager.consoleMessageRepository.getAllMessageOfSim(simInfo.simId));
                    }

                    status = SerialPortStatus.SLEEPING;
//                    Thread.sleep(SLEEP_TIME);

                    while (!isFinishReadMsg && !isStop) {
                        System.out.println(simInfo.commName + ": wait finish read new message 1");
                        System.out.println(simInfo.commName + ": lineList: " + messageLineList);

                        status = SerialPortStatus.SLEEPING;
                        Thread.sleep(200);
                    }


                    for (int i = 0; i < manager.appConfig.READ_SIGNAL_TIME; i++) {
                        System.out.println(simInfo.commName + " : " + i + " : " + status);
                        if (!isStop) {
                            while (!isFinishReadMsg && !isStop) {
                                status = SerialPortStatus.SLEEPING;
                                System.out.println(simInfo.commName + ": wait read message in for");
                                Thread.sleep(200);
                            }
                            if (!isStop) {
                                status = SerialPortStatus.READING;
                                runCmd(Contract.SIGNAL);
//                                Thread.sleep(SLEEP_TIME / 2);
                                status = SerialPortStatus.SLEEPING;
//                                Thread.sleep(SLEEP_TIME / 2);
                            }
                        } else {
                            status = SerialPortStatus.SLEEPING;
                        }
                    }

                    while (!isFinishReadMsg && !isStop) {
                        System.out.println(simInfo.commName + ": wait finish read new message 2");
                        System.out.println(simInfo.commName + ": lineList: " + messageLineList);

                        status = SerialPortStatus.SLEEPING;
                        Thread.sleep(200);
                    }

                    if (simInfo.consoleMessageList != null && simInfo.consoleMessageList.size() > manager.appConfig.MSG_MAX_SIZE) {
                        while (simInfo.consoleMessageList.size() > 0) {
                            status = SerialPortStatus.READING;
                            if (!isStop) {
                                ConsoleMessage consoleMessage = simInfo.consoleMessageList.get(0);
                                runCmd(Contract.DELETE_MGS + consoleMessage.mgsId);
                                simInfo.consoleMessageList.remove(0);
                                Thread.sleep(400);
                            } else {
                                break;
                            }
                        }
                    }
                    manager.saveSimInfo(simInfo);
                    if (!isStop) startTracking();
                } catch (Exception e) {
                    e.printStackTrace();

                    repeatReadingSimInfo();
                }
            });
        }
    }

    public void readNewMessage(String outString) {
        if (isStop) return;
        try {
            messageLineList.clear();
            simInfo.lastMsgId = Integer.valueOf(outString.split(",")[1]);
            simInfo.time = TimeUtil.getTime();
            System.out.println(simInfo.commName + ": ---> new message: " + outString);
            startReadMessage(simInfo.lastMsgId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void startReadMessage(int msgId) {
        if (isStop) return;
        executor.execute(() -> {
            try {
                isFinishReadMsg = false;
                messageLineList.clear();
                while (status != SerialPortStatus.SLEEPING) {
                    Thread.sleep(200);
                    System.out.println(simInfo.commName + ": last cmd: " + lastCmd);
                    System.out.println(simInfo.commName + ": wait sleep to read new message");
                }
                System.out.println(simInfo.commName + ": start read message: " + msgId);
                runCmd(Contract.TEXT_MODE);
                Thread.sleep(1000);
                runCmd(Contract.MESSAGES + msgId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void startGetAllMessageFromSim() {
        if (isStop) return;
        executor.execute(() -> {
            try {
                isFinishReadMsg = false;
                messageLineList.clear();
                while (status != SerialPortStatus.SLEEPING) {
                    Thread.sleep(200);
                    System.out.println("last cmd: " + lastCmd);
                    System.out.println("wait sleep to read all message");
                }
                System.out.println("start update all message");
                runCmd(Contract.TEXT_MODE);
                Thread.sleep(1000);
                runCmd(Contract.MESSAGES_ALL);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void parseNewMessages() {
        System.out.println(simInfo.commName + ": ---> parse new messages");
        ConsoleMessage consoleMessage = new ConsoleMessage();
        consoleMessage.mgsId = simInfo.lastMsgId;
        consoleMessage.simId = simInfo.simId;
        consoleMessage.isMessage = true;

        System.out.println(simInfo.commName + ": list: " + messageLineList);
        int index = 0;
        String line = messageLineList.get(0);
        if (line.startsWith("+CMGR")) {
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
                System.out.println(simInfo.lastMsgId + "," + type + "," + sdt + "," + time + "," + content);

                consoleMessage.status = type;
                consoleMessage.sdtGui = sdt.toUpperCase();
                consoleMessage.time = localTime;
                consoleMessage.simTime = time;
                consoleMessage.content = content;

                manager.consoleMessageRepository.save(consoleMessage);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        messageLineList.clear();
        simInfo.consoleMessageList = new ArrayList<>(manager.consoleMessageRepository.getAllMessageOfSim(simInfo.simId));

        simInfo.time = TimeUtil.getTime();
        isFinishReadMsg = true;
    }

    public void parseAllMessages() {
        System.out.println("---> parse messages");
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
                    System.out.println(id + "," + type + "," + sdt + "," + time + "," + content);
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
        System.out.println("size: " + simInfo.consoleMessageList.size());
        isFinishReadMsg = true;
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
