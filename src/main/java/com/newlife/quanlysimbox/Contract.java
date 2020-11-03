package com.newlife.quanlysimbox;

public class Contract {
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
}