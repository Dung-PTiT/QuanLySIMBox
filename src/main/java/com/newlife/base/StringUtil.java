package com.newlife.base;

import java.nio.charset.StandardCharsets;

public class StringUtil {
    public static String hexStringToText(String hex) {
        byte[] bytes = javax.xml.bind.DatatypeConverter.parseHexBinary(hex);
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
