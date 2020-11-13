package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.model.Script;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface ScriptReponsitory extends JpaRepository<Script, Integer> {
}
