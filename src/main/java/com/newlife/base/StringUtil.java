package com.newlife.base;

import java.nio.charset.StandardCharsets;

public class StringUtil {
    public static String hexStringToText(String hex) {
        try {
            byte[] bytes = javax.xml.bind.DatatypeConverter.parseHexBinary(hex);
            return new String(bytes, StandardCharsets.UTF_16);
        }catch (Exception e){
            e.printStackTrace();
        }
        return hex;
    }

    public static boolean isNumber(String str){
        try{
            Long.parseLong(str);
            return true;
        }catch (Exception e){
            return false;
        }
    }
}
