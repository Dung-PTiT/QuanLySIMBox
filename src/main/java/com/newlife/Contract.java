package com.newlife;

public class Contract {
    // time
    public static long SAVE_DEVICE_STATUS_TIME = 10000;
    public static long READ_DEVICE_STATUS_TIME = SAVE_DEVICE_STATUS_TIME + 5000;

    // at
    public static String SIM_ID = "AT+CIMI";
    public static String NETWORK = "AT+COPS?";
    public static String PIN = "AT+CPIN?";
    public static String SIGNAL = "AT+CSQ";
    public static String MESSAGES_ALL = "AT+CMGL=\"ALL\"";
    public static String MESSAGES = "AT+CMGR=";
    public static String REJECT_CALL = "ATH";
    public static String BALANCE = "ATDT*101#;";
    public static String AT = "AT";
    public static String TEXT_MODE = "AT+CMGF=1";
    public static String DELETE_MGS = "AT+CMGD=";


    // nox
    public static String NOX_FOLDER = "C:/Nox";
//    public static String NOX_FOLDER = "D:/Nox";
    public static String NOX_ADB = NOX_FOLDER + "\\bin\\nox_adb.exe";
    public static String NOX = NOX_FOLDER + "\\bin\\Nox.exe";
    public static String NOX_DEVICES = NOX_FOLDER + "\\bin\\BignoxVMS";
    public static String NOX_TEMPLATE_FILE = NOX_FOLDER + "\\bin\\template\\disk2.vmdk";


    // auto tool
    public static String AUTO_TOOL_FOLDER = "C:\\Users\\admin\\source\\repos\\Tool\\Tool\\bin\\x86\\Debug\\netcoreapp3.1";
    public static String AUTO_TOOL = "Tool.exe";

    // icon
    public static String FACEBOOK_ICON = "./images/brands/facebook.png";
    public static String ZALO_ICON = "./images/brands/zalo.png";
    public static String YOUTUBE_ICON = "./images/brands/youtube.png";
    public static String SKYPE_ICON = "./images/brands/skype.png";
    public static String GMAIL_ICON = "./images/brands/gmail.png";
    public static String LINE_ICON = "./images/brands/line.png";
    public static String VIPER_ICON = "./images/brands/viper.png";
    public static String WHATSAPP_ICON = "./images/brands/whatsapp.png";

}