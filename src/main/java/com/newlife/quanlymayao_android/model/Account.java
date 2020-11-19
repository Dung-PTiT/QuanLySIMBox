package com.newlife.quanlymayao_android.model;

import javax.persistence.*;

@Entity
@Table(name = "account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;
    public String username;
    public String password;
    @Column(name = "sim_id")
    public String simId;
    public String type;
    public String status;
}
