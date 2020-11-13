package com.newlife.quanlysimbox.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping({"/","/simbox"})
    public String goToSimbox() {
        return "simbox";
    }

    @GetMapping("/device")
    public String goToDashboard() {
        return "device";
    }

}
