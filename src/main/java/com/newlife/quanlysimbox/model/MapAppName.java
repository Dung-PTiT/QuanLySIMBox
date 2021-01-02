package com.newlife.quanlysimbox.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
@Table(name = "map_app_name")
public class MapAppName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    public String appName;
    public String words;
}
