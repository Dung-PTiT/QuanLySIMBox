package com.newlife.quanlymayao_android.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "script")
@Data
public class Script {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int id;
    public String name;
    public String type;
}
