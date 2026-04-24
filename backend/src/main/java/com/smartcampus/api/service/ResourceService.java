package com.smartcampus.api.service;

import com.smartcampus.api.dto.ResourceRequestDTO;
import com.smartcampus.api.dto.ResourceResponseDTO;
import com.smartcampus.api.dto.ResourceStatsDTO;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import com.smartcampus.api.repository.ResourceRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public ResourceResponseDTO createResource(ResourceRequestDTO requestDTO) {
        Resource resource = mapToEntity(requestDTO);
        Resource savedResource = resourceRepository.save(resource);
        return mapToResponse(savedResource);
    }

    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO requestDTO) {
        Resource existingResource = resourceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existingResource.setName(requestDTO.getName());
        existingResource.setType(requestDTO.getType());
        existingResource.setCapacity(requestDTO.getCapacity());
        existingResource.setLocation(requestDTO.getLocation());
        existingResource.setStatus(requestDTO.getStatus());
        existingResource.setAvailabilityWindows(requestDTO.getAvailabilityWindows());
        existingResource.setDescription(requestDTO.getDescription());

        Resource updatedResource = resourceRepository.save(existingResource);
        return mapToResponse(updatedResource);
    }

    public void deleteResource(String id) {
        Resource existingResource = resourceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resourceRepository.delete(existingResource);
    }

    public List<ResourceResponseDTO> searchResources(
            ResourceType type, Integer capacity, String location, ResourceStatus status) {
        return resourceRepository.findAll().stream()
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> capacity == null || resource.getCapacity() >= capacity)
                .filter(resource -> location == null
                        || resource.getLocation() != null
                                && resource.getLocation().toLowerCase(Locale.ROOT).contains(location.toLowerCase(Locale.ROOT)))
                .filter(resource -> status == null || resource.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceStatsDTO getResourceStats() {
        long totalResources = resourceRepository.count();
        long activeResources = resourceRepository.countByStatus(ResourceStatus.ACTIVE);
        long outOfServiceResources = resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE);

        Map<String, Long> resourcesByType = new LinkedHashMap<>();
        for (ResourceType type : ResourceType.values()) {
            resourcesByType.put(type.name(), resourceRepository.countByType(type));
        }

        return ResourceStatsDTO.builder()
                .totalResources(totalResources)
                .activeResources(activeResources)
                .outOfServiceResources(outOfServiceResources)
                .resourcesByType(resourcesByType)
                .build();
    }

    private Resource mapToEntity(ResourceRequestDTO requestDTO) {
        return Resource.builder()
                .name(requestDTO.getName())
                .type(requestDTO.getType())
                .capacity(requestDTO.getCapacity())
                .location(requestDTO.getLocation())
                .status(requestDTO.getStatus())
                .availabilityWindows(requestDTO.getAvailabilityWindows())
                .description(requestDTO.getDescription())
                .build();
    }

    private ResourceResponseDTO mapToResponse(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .availabilityWindows(resource.getAvailabilityWindows())
                .description(resource.getDescription())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
