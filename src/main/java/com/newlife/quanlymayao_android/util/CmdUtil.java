package com.newlife.quanlymayao_android.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;

public class CmdUtil {
    public static ArrayList<String> runCmd(String cmd) {
        ArrayList<String> output = new ArrayList<>();
        try {
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", cmd);
            builder.redirectErrorStream(true);
            Process p = builder.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while (true) {
                line = r.readLine();
                if (line == null) {
                    break;
                }
                output.add(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return output;
    }

    public static void runCmdWithoutOutput(String cmd) {
        try {
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", cmd);
            builder.redirectErrorStream(true);
            builder.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getProcessIdOfNox(String noxId) {
        String cmd = "wmic process where caption=\"NoxVMHandle.exe\" get commandline,processid";
        ArrayList<String> list = CmdUtil.runCmd(cmd);
        String processId = "";
        for (int i = 0; i < list.size(); i++) {
            String content = list.get(i).trim();
//            System.out.println(i + " : " + list.get(i));
            if (content.contains(noxId)) {
                String[] words = content.split(" ");
                processId = words[words.length - 1];
                break;
            }
        }
        return processId;
    }

    public static boolean killNoxVMHandle(String processId){
        ArrayList<String> outputs = runCmd("TASKKILL /PID /F " + processId);
        for (int i = 0; i < outputs.size(); i++) {
//            System.out.println(outputs.get(i));
            if(outputs.get(i).contains("SUCCESS")){
                return true;
            }
        }
        return false;
    }
}
