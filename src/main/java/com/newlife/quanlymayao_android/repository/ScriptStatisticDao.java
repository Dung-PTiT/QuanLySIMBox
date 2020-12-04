package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.communicator.DeviceManager;
import com.newlife.quanlymayao_android.model.RunScriptDuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.jpa.EntityManagerFactoryInfo;

import java.sql.*;
import java.util.ArrayList;

public class ScriptStatisticDao {

    @Autowired
    DeviceManager deviceManager;

    public static Connection conn;

    public ScriptStatisticDao() {
        try {
            conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/quanlysimbox", "root", "phamvankhoa");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public long countRunScriptTimes(String status) {
        if (conn == null) return 0;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            if (status.isEmpty()) {
                rs = stmt.executeQuery("select max(run_times) from device_status;");
                if (rs.next()) {
                    return rs.getLong(1);
                }
            } else {
                rs = stmt.executeQuery("select count(a.id)\n" +
                        "from (\n" +
                        "         select id, device_id, time, status, action, info, run_times\n" +
                        "         from device_status\n" +
                        "         where is_active = true\n" +
                        "           and status != 'free'\n" +
                        "           and run_times != 0\n" +
                        "         group by run_times, status, action, info\n" +
                        "     ) as a\n" +
                        "where a.status = '" + status + "';");
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public ArrayList<RunScriptDuration> getRunScriptDurationList() {
        ArrayList<RunScriptDuration> list = new ArrayList<>();
        if (conn == null) return list;
        RunScriptDuration runScriptDuration;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            rs = stmt.executeQuery("select run_times, min(time) as begin, max(time) as finish\n" +
                    "from (select time, run_times\n" +
                    "      from device_status\n" +
                    "      where is_active = true\n" +
                    "        and status != 'free'\n" +
                    "        and run_times != 0\n" +
                    "      group by run_times, status, action, info) as a\n" +
                    "group by run_times;");
            while (rs.next()) {
                runScriptDuration = new RunScriptDuration();
                runScriptDuration.runTimes = rs.getLong("run_times");
                runScriptDuration.begin = rs.getLong("begin");
                runScriptDuration.finish = rs.getLong("finish");
                list.add(runScriptDuration);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }
}
