package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.MappedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface MappedMessageRepository extends JpaRepository<MappedMessage, Long> {
}
