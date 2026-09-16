package com.keystone.service;

import com.keystone.dto.PartRequest;
import com.keystone.dto.PartResponse;
import com.keystone.entity.Part;
import com.keystone.repository.PartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartService {

    private final PartRepository parts;

    public PartService(PartRepository parts) {
        this.parts = parts;
    }

    public List<PartResponse> getAll() {
        return parts.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PartResponse getById(Long id) {
        return toResponse(
                parts.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException("Part not found"))
        );
    }

    public PartResponse create(PartRequest request) {

        if (parts.existsByPartNumber(request.getPartNumber())) {
            throw new IllegalArgumentException(
                    "Part number already exists");
        }

        Part part = new Part();

        part.setName(request.getName());
        part.setPartNumber(request.getPartNumber());
        part.setQuantity(request.getQuantity());
        part.setUnitPrice(request.getUnitPrice());
        part.setMinimumStock(request.getMinimumStock());

        return toResponse(parts.save(part));
    }

    public PartResponse update(Long id, PartRequest request) {

        Part part = parts.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Part not found"));

        if (!part.getPartNumber()
                .equals(request.getPartNumber())
                && parts.existsByPartNumber(request.getPartNumber())) {

            throw new IllegalArgumentException(
                    "Part number already exists");
        }

        part.setName(request.getName());
        part.setPartNumber(request.getPartNumber());
        part.setQuantity(request.getQuantity());
        part.setUnitPrice(request.getUnitPrice());
        part.setMinimumStock(request.getMinimumStock());

        return toResponse(parts.save(part));
    }

    public void delete(Long id) {

        if (!parts.existsById(id)) {
            throw new IllegalArgumentException("Part not found");
        }

        parts.deleteById(id);
    }

    public List<PartResponse> getLowStock() {

        return parts.findByQuantityLessThanEqual(
                        Integer.MAX_VALUE)
                .stream()
                .filter(p -> p.getQuantity() <= p.getMinimumStock())
                .map(this::toResponse)
                .toList();
    }

    private PartResponse toResponse(Part part) {

        PartResponse response = new PartResponse();

        response.setId(part.getId());
        response.setName(part.getName());
        response.setPartNumber(part.getPartNumber());
        response.setQuantity(part.getQuantity());
        response.setUnitPrice(part.getUnitPrice());
        response.setMinimumStock(part.getMinimumStock());
        response.setLowStock(
                part.getQuantity() <= part.getMinimumStock()
        );

        return response;
    }
}