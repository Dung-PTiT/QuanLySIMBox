package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.model.ScriptChain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface ScriptChainRepository extends JpaRepository<ScriptChain, Integer> {
    @Modifying(clearAutomatically = true)
    @Query("update ScriptChain s set s.name = :name, s.strScriptIds = :strScriptIds where s.id = :id")
    int update(@Param("name") String name, @Param("strScriptIds") String strScriptIds, @Param("id") int id);

}
