package com.newlife.quanlymayao_android.model;

import lombok.Data;

import java.io.Serializable;

@Data
public class RequestScript implements Serializable {
    public String deviceId;
    public Integer scriptId;
    public Long accountId;
}