package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.communicator.DeviceManager;
import com.newlife.quanlymayao_android.model.KichBan_LanChay;
import com.newlife.quanlymayao_android.model.RunScriptDuration;
import com.newlife.quanlymayao_android.model.RunScriptTimesInfo;
import org.springframework.beans.factory.annotation.Autowired;

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

    public ArrayList<RunScriptTimesInfo> getRunScriptTimesInfo(long startTime, long endTime) {
        ArrayList<RunScriptTimesInfo> list = new ArrayList<>();
        if (conn == null) return list;
        RunScriptTimesInfo runScriptTimesInfo;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            String sql = "select *\n" +
                    "from (\n" +
                    "     select id, device_id, time, status, action, info, run_times\n" +
                    "     from device_status\n" +
                    "     where is_active = true\n" +
                    "       and status != 'free'\n" +
                    "       and run_times != 0\n" +
                    "     group by run_times, status, action, info) as a\n" +
                    "where a.run_times in (\n" +
                    "    select run_times\n" +
                    "    from (\n" +
                    "             select run_times, min(time) as begin, max(time) as finish\n" +
                    "             from (select time, run_times\n" +
                    "                   from device_status\n" +
                    "                   where is_active = true\n" +
                    "                     and status != 'free'\n" +
                    "                     and run_times != 0\n" +
                    "                   group by run_times, status, action, info) as a\n" +
                    "             group by run_times\n" +
                    "         ) as b\n" +
                    "    where b.begin >= " + startTime + "\n" +
                    "      and b.finish <= " + (endTime + 120000) + "\n" +
                    ");";
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                runScriptTimesInfo = new RunScriptTimesInfo();
                runScriptTimesInfo.id = rs.getLong("id");
                runScriptTimesInfo.deviceId = rs.getString("device_id");
                runScriptTimesInfo.time = rs.getLong("time");
                runScriptTimesInfo.status = rs.getString("status");
                runScriptTimesInfo.info = rs.getString("info");
                runScriptTimesInfo.action = rs.getString("action");
                runScriptTimesInfo.runTimes = rs.getString("run_times");
                list.add(runScriptTimesInfo);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public String getScriptName(int scriptId) {
        if (conn == null) return "";
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            rs = stmt.executeQuery("select name from script where id = " + scriptId);
            if (rs.next()) {
                return rs.getString(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    public ArrayList<KichBan_LanChay> getKichBanLanChayList(long startTime, long endTime) {
        ArrayList<KichBan_LanChay> list = new ArrayList<>();
        if (conn == null) return list;
        KichBan_LanChay kblc;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            String sql = "select count(script_id) as sum, script_id\n" +
                    "from (\n" +
                    "         select *\n" +
                    "         from (\n" +
                    "                  select script_id, run_times\n" +
                    "                  from device_status\n" +
                    "                  where is_active = true\n" +
                    "                    and status != 'free'\n" +
                    "                    and run_times != 0\n" +
                    "                  group by run_times) as a\n" +
                    "         where a.run_times in (\n" +
                    "             select run_times\n" +
                    "             from (\n" +
                    "                      select run_times, min(time) as begin, max(time) as finish\n" +
                    "                      from (select time, run_times\n" +
                    "                            from device_status\n" +
                    "                            where is_active = true\n" +
                    "                              and status != 'free'\n" +
                    "                              and run_times != 0\n" +
                    "                            group by run_times, status, action, info) as a\n" +
                    "                      group by run_times\n" +
                    "                  ) as b\n" +
                    "             where b.begin >= " + startTime + "\n" +
                    "               and b.finish <= " + (endTime + 120000) + "\n" +
                    "         )\n" +
                    "     ) as c\n" +
                    "group by script_id;";
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                kblc = new KichBan_LanChay();
                kblc.scriptId = rs.getInt("script_id");
                kblc.count = rs.getLong("sum");
                kblc.scriptName = getScriptName(kblc.scriptId);
                list.add(kblc);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public ArrayList<RunScriptTimesInfo> getLastRunScriptTimesInfo(long startTime, long endTime) {
        ArrayList<RunScriptTimesInfo> list = new ArrayList<>();
        if (conn == null) return list;
        RunScriptTimesInfo runScriptTimesInfo;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            String sql = "select id, device_id, time, status, action, info, script_id, run_times\n" +
                    "from device_status\n" +
                    "where id in (\n" +
                    "    select max(a.id)\n" +
                    "    from (\n" +
                    "             select id, device_id, time, status, action, info, run_times\n" +
                    "             from device_status\n" +
                    "             where is_active = true\n" +
                    "               and status != 'free'\n" +
                    "               and run_times != 0\n" +
                    "             group by run_times, status, action, info) as a\n" +
                    "    where a.run_times in (\n" +
                    "        select run_times\n" +
                    "        from (\n" +
                    "                 select run_times, min(time) as begin, max(time) as finish\n" +
                    "                 from (select time, run_times\n" +
                    "                       from device_status\n" +
                    "                       where is_active = true\n" +
                    "                         and status != 'free'\n" +
                    "                         and run_times != 0\n" +
                    "                       group by run_times, status, action, info) as a\n" +
                    "                 group by run_times\n" +
                    "             ) as b\n" +
                    "        where b.begin >= " + startTime + "\n" +
                    "          and b.finish <= " + (endTime + 120000) + "\n" +
                    "    )\n" +
                    "    group by a.run_times\n" +
                    ");";
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                runScriptTimesInfo = new RunScriptTimesInfo();
                runScriptTimesInfo.id = rs.getLong("id");
                runScriptTimesInfo.scriptId = rs.getInt("script_id");
                runScriptTimesInfo.scriptName = getScriptName(runScriptTimesInfo.scriptId);
                runScriptTimesInfo.deviceId = rs.getString("device_id");
                runScriptTimesInfo.time = rs.getLong("time");
                runScriptTimesInfo.status = rs.getString("status");
                runScriptTimesInfo.info = rs.getString("info");
                runScriptTimesInfo.runTimes = rs.getString("run_times");
                runScriptTimesInfo.action = rs.getString("action");
                list.add(runScriptTimesInfo);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public ArrayList<RunScriptTimesInfo> getFailRunScriptTimesInfo(long startTime, long endTime) {
        ArrayList<RunScriptTimesInfo> list = new ArrayList<>();
        if (conn == null) return list;
        RunScriptTimesInfo runScriptTimesInfo;
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs;
            String sql = "select id, device_id, time, status, action, info, run_times\n" +
                    "from device_status\n" +
                    "where id in (\n" +
                    "    select max(a.id)\n" +
                    "    from (\n" +
                    "             select id, device_id, time, status, action, info, run_times\n" +
                    "             from device_status\n" +
                    "             where is_active = true\n" +
                    "               and status != 'free'\n" +
                    "               and run_times != 0\n" +
                    "             group by run_times, status, action, info) as a\n" +
                    "    where a.run_times in (\n" +
                    "        select run_times\n" +
                    "        from (\n" +
                    "                 select run_times, min(time) as begin, max(time) as finish\n" +
                    "                 from (select time, run_times\n" +
                    "                       from device_status\n" +
                    "                       where is_active = true\n" +
                    "                         and status != 'free'\n" +
                    "                         and run_times != 0\n" +
                    "                       group by run_times, status, action, info) as a\n" +
                    "                 group by run_times\n" +
                    "             ) as b\n" +
                    "        where b.begin >= " + startTime + "\n" +
                    "          and b.finish <= " + (endTime + 120000) + "\n" +
                    "    )\n" +
                    "    group by a.run_times\n" +
                    ") and status = 'fail';";
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                runScriptTimesInfo = new RunScriptTimesInfo();
                runScriptTimesInfo.id = rs.getLong("id");
                runScriptTimesInfo.deviceId = rs.getString("device_id");
                runScriptTimesInfo.time = rs.getLong("time");
                runScriptTimesInfo.status = rs.getString("status");
                runScriptTimesInfo.info = rs.getString("info");
                runScriptTimesInfo.runTimes = rs.getString("run_times");
                runScriptTimesInfo.action = rs.getString("action");
                list.add(runScriptTimesInfo);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }
}
