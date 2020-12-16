package com.newlife.quanlymayao_android.repository;

import com.newlife.Contract;
import com.newlife.quanlymayao_android.model.DeviceStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Repository
public interface DeviceStatusRepository extends JpaRepository<DeviceStatus, Long> {
    @Query("SELECT s " +
            "FROM DeviceStatus s " +
            "WHERE s.id IN (" +
            "   SELECT Max(d.id)" +
            "   FROM DeviceStatus d" +
            "   WHERE :time - s.time <= :limitTime" +
            "   AND d.device.deviceId like %:deviceId%" +
            "   GROUP BY d.device.deviceId" +
            ") and s.isDeleted = false")
    ArrayList<DeviceStatus> findDeviceStatusLast(@Param("time") long time,
                                                 @Param("limitTime") long limitTime,
                                                 @Param("deviceId") String deviceId, Pageable pageable);

    @Query("SELECT s FROM DeviceStatus s where s.device.deviceId = :deviceId " +
//            "GROUP BY s.status, s.action, s.message, s.runTimes, s.info " +
            "ORDER BY s.time DESC")
    ArrayList<DeviceStatus> getLogDivice(Pageable pageable, @Param("deviceId") String deviceId);

    @Query("SELECT max(s.runTimes) from DeviceStatus s")
    Long getMaxScriptRunTimes();

    @Query("select max(d.runTimes) from DeviceStatus d")
    Long getTotalRunTimes();

}