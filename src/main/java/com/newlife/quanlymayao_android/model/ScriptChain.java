package com.newlife.quanlymayao_android.model;

import lombok.Data;

import javax.persistence.*;
import java.util.ArrayList;

@Entity
@Table(name = "script_chain")
@Data
public class ScriptChain {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int id;
    public String name;
    public String strScriptIds = "";
    @Transient
    public ArrayList<Script> scriptList;
}
