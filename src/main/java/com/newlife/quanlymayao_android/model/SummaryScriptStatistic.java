package com.newlife.quanlymayao_android.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryScriptStatistic implements Serializable {

    public long totalRunTimes;
    public long successRunTimes;
    public long failRunTimes;
    public long avg;
}
