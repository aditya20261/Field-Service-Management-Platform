package com.keystone.repository;

import com.keystone.entity.Role;
import com.keystone.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);

    long countByRoleAndActive(
            Role role,
            boolean active
    );
}