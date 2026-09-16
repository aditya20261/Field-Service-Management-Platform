package com.keystone.repository;

import com.keystone.entity.ServiceRequest;
import com.keystone.entity.ServiceRequestStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByCustomerId(Long customerId);

    List<ServiceRequest> findByCustomerIdAndStatus(
            Long customerId,
            ServiceRequestStatus status
    );

    boolean existsByIdAndCustomerId(
            Long id,
            Long customerId
    );

    long countByCustomerId(Long customerId);

    long countByCustomerIdAndStatus(
            Long customerId,
            ServiceRequestStatus status
    );
}