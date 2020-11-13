package com.newlife.quanlysimbox.repository;

import com.newlife.quanlysimbox.model.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
@Transactional
public interface MessagesRepository extends JpaRepository<Messages, Long> {
}
