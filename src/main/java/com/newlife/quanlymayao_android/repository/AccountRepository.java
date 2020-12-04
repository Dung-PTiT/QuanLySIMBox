package com.newlife.quanlymayao_android.repository;

import com.newlife.quanlymayao_android.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public interface AccountRepository extends JpaRepository<Account, Long> {
    @Query("select a from Account a where a.type like %:appName% and a.status = 'free'")
    List<Account> findAccountByType(@Param("appName") String appName);
}
