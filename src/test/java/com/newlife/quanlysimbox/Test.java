package com.newlife.quanlysimbox;

import com.newlife.Contract;

public class Test {
    public static void main(String[] args) {
        try {
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", Contract.NOX + " -clone:Nox_1");
            builder.redirectErrorStream(true);
            Process p = builder.start();
//            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
//            String line;
//            while (true) {
//                line = r.readLine();
//                if (line == null) {
//                    break;
//                }
//                System.out.println(line);
//            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
