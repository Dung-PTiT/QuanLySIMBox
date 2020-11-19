package com.newlife.base;

import javax.management.Attribute;
import javax.management.AttributeList;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;

public class SystemUtil {
    public static String getMemoryUsed(){
        Runtime runtime = Runtime.getRuntime();
        long memoryMax = runtime.maxMemory();
        long memoryUsed = runtime.totalMemory() - runtime.freeMemory();
        return String.format("%.1f",(memoryUsed * 100.0) / memoryMax);
    }
    public static String getProcessCpuUsed() {
        try {
            MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
            ObjectName name = ObjectName.getInstance("java.lang:type=OperatingSystem");
            AttributeList list = mbs.getAttributes(name, new String[]{"ProcessCpuLoad"});

            if (list.isEmpty()) return "NaN";

            Attribute att = (Attribute) list.get(0);
            Double value = (Double) att.getValue();

            // usually takes a couple of seconds before we get real values
            if (value == -1.0) return "NaN";
            // returns a percentage value with 1 decimal point precision
            return String.valueOf((int) (value * 1000) / 10.0);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "NaN";
    }
}
