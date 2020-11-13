package com.newlife.quanlymayao_android.model;

import javax.persistence.*;

@Entity
@Table(name = "script")
public class Script {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public int id;
    public String name;
    public String type;
}
