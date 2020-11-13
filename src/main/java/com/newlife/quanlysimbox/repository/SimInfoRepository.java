package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.SimInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
@Transactional
public interface SimInfoRepository extends JpaRepository<SimInfo, Long> {
}
