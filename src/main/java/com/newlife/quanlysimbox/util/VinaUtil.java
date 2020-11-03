package com.newlife.quanlysimbox.util;

public class VinaUtil {
    public static String ngayHetHanVina(String outString) {
        try {
            String prefix = "Han su dung ";
            int startIndex = outString.indexOf(prefix) + prefix.length();
            return outString.substring(startIndex, startIndex + 10);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static long[] getBalanceVINA(String outString) {
        long tkChinh = 0;
        long tkPhu = 0;
        String[] splits = outString.split(",");
        for (int i = 0; i < splits.length; i++) {
            String content = splits[i];
            try {
                if (content.contains("TK chinh=")) {
                    String str = content.substring(content.indexOf("=") + 1, content.indexOf("VND")).trim();
                    tkChinh = Long.valueOf(str);
                } else if (content.contains("KM") || content.contains("DK")) {
                    String str = content.substring(content.indexOf("=") + 1, content.indexOf("VND")).trim();
                    tkPhu += Long.valueOf(str);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return new long[]{tkChinh, tkPhu};
    }
}
