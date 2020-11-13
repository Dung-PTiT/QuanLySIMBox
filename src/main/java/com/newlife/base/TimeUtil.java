package com.newlife.base;

import java.text.SimpleDateFormat;
import java.util.Date;

public class TimeUtil {
    static SimpleDateFormat dateFormat;

    public static String getTime() {
        Date date = new Date();
        dateFormat = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");
        return dateFormat.format(date);
    }

    // 20/11/0313:20:58+28
    public static String parseMgsTime(String strTime) {
        String result = strTime;
        try {
            dateFormat = new SimpleDateFormat("yy/MM/dd HH:mm:ss");
            Date date = dateFormat.parse(strTime);
            dateFormat = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");
            result = dateFormat.format(date);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
