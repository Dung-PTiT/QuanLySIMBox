package com.newlife.quanlymayao_android.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;

@Entity
@Table(name = "script_chain")
@Data
public class ScriptChain implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int id;
    public String name;
    public String strScriptIds = "";
    @Transient
    public ArrayList<Script> scriptList;
}
