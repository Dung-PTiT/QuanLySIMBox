package com.newlife.quanlymayao_android.model;

import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;

@Data
public class RequestScriptList implements Serializable {
    public ArrayList<RequestScript> list = new ArrayList<>();
}
