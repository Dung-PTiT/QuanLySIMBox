package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.model.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Repository
@Transactional
public interface DeviceStatusRepository extends JpaRepository<DeviceStatus, Long> {
    @Query("select s from DeviceStatus s where :time - s.time <= 5000")
    ArrayList<DeviceStatus> findAllDeviceStatusLast(@Param("time") long time);
}
