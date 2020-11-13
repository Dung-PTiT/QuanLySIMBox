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
}
