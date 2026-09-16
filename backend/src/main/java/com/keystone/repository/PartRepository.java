package com.keystone.repository;

import com.keystone.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findByPartNumber(String partNumber);

    boolean existsByPartNumber(String partNumber);

    List<Part> findByQuantityLessThanEqual(Integer quantity);
}