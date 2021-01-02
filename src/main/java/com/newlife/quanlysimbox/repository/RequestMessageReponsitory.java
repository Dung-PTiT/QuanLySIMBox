package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.RequestMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public interface RequestMessageReponsitory extends JpaRepository<RequestMessage, Long> {

    @Query("select m from RequestMessage m " +
            "where m.simId=:simId and m.appName=:appName and m.mapped = 0 and (:currentTime - (UNIX_TIMESTAMP(m.sendCodeTime)*1000) < 600000 ) " +
            "ORDER BY m.sendCodeTime DESC")
    List<RequestMessage> getRequestMessage(@Param("simId") String simId,
                                           @Param("appName") String appName,
                                           @Param("currentTime") long currentTime);

    @Modifying
    @Query("update RequestMessage m set m.mapped=1 where m.id = :id")
    void updateRequestMessage(@Param("id") long id);
}
