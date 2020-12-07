package com.newlife.base;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class TimeUtil {
    static SimpleDateFormat dateFormat;

    public static String getTime() {
        Date date = new Date();
        dateFormat = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");
        return dateFormat.format(date);
    }

    // 20/11/0313:20:58+28
    public static Date parseMgsTime(String strTime) {
        String result = strTime;
        try {
            dateFormat = new SimpleDateFormat("yy/MM/dd HH:mm:ss");
            Date date = dateFormat.parse(strTime);
            return date;
//            dateFormat = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");
//            result = dateFormat.format(date);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Date();
    }

    public static long getEndTimeOfDate(long time){
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(time);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        long result = calendar.getTimeInMillis();
        return result;
    }

    public static long[] parseTimeString(String startTimeStr, String endTimeStr){
        SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy");
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(df.parse(startTimeStr));
            long startTime = calendar.getTimeInMillis();

            calendar.setTime(df.parse(endTimeStr));
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            long endTime = calendar.getTimeInMillis();
            return new long[]{startTime, endTime};
        } catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }
}
