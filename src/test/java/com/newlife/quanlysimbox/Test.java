package com.newlife.quanlysimbox;

import com.newlife.quanlymayao_android.util.CmdUtil;

import javax.management.Attribute;
import javax.management.AttributeList;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;

public class Test {
    public static void main(String[] args) {
        String cmd = "wmic process where caption=\"NoxVMHandle.exe\" get commandline,processid";
        ArrayList<String> list = CmdUtil.runCmd(cmd);
        String processId = "";
        for (int i = 0; i < list.size(); i++) {
            String content = list.get(i).trim();
            if(content.contains("Nox_1")){
                String[] words = content.split(" ");
                processId = words[words.length-1];
                break;
            }
        }
        System.out.println(processId);
    }
}
