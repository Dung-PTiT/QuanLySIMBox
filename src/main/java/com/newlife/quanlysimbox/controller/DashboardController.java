package com.newlife.quanlysimbox.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/")
    public String goToDashboard() {
        return "admin/simbox";
    }

}
