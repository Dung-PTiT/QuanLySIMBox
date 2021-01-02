package com.newlife.base;

public class LogUtil {
    public static void println(AppConfig appConfig, String text) {
        if (appConfig.SHOW_LOG) System.out.println(text);
    }
}
