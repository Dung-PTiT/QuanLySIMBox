package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.ConsoleMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.ArrayList;

@Repository
@Transactional
public interface ConsoleMessageRepository extends JpaRepository<ConsoleMessage, Long> {

    @Modifying
    @Query("delete from ConsoleMessage m where m.simId=:simId")
    void deleteAllMessageOfSim(@Param("simId") String simId);

    @Query("select m from ConsoleMessage m where m.simId=:simId")
    ArrayList<ConsoleMessage> getAllMessageOfSim(@Param("simId") String simId);
}
