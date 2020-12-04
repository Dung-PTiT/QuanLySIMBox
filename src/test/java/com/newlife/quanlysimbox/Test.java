package com.newlife.quanlysimbox;

import com.newlife.quanlymayao_android.repository.ScriptStatisticDao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class Test {
    public static void main(String[] args) {
        ScriptStatisticDao scriptStatisticDao = new ScriptStatisticDao();
        System.out.println(scriptStatisticDao.countRunScriptTimes(""));
        System.out.println(scriptStatisticDao.countRunScriptTimes("complete"));
        System.out.println(scriptStatisticDao.countRunScriptTimes("fail"));
    }
}
