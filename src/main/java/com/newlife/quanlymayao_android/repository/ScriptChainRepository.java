package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.model.ScriptChain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface ScriptChainRepository extends JpaRepository<ScriptChain, Integer> {
}
