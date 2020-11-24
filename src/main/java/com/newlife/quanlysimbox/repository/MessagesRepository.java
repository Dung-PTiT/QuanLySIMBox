package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
@Transactional
public interface MessagesRepository extends JpaRepository<Messages, Long> {

    @Modifying
    @Query("delete from Messages m where m.simId=:simId")
    void deleteAllMessageOfSim(@Param("simId") String simId);
}
