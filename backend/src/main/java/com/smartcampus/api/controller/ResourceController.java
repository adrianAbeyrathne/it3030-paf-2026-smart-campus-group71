package com.smartcampus.api.controller;

import com.smartcampus.api.dto.ApiResponse;
import com.smartcampus.api.dto.ResourceRequestDTO;
import com.smartcampus.api.dto.ResourceResponseDTO;
import com.smartcampus.api.dto.ResourceStatsDTO;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import com.smartcampus.api.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3001")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> createResource(@Valid @RequestBody ResourceRequestDTO requestDTO) {
        ResourceResponseDTO createdResource = resourceService.createResource(requestDTO);
        ApiResponse<ResourceResponseDTO> response = new ApiResponse<>(true, "Resource created successfully", createdResource);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        List<ResourceResponseDTO> resources = (type != null || capacity != null || location != null || status != null)
                ? resourceService.searchResources(type, capacity, location, status)
                : resourceService.getAllResources();
        ApiResponse<List<ResourceResponseDTO>> response = new ApiResponse<>(true, "Resources fetched successfully", resources);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> getResourceById(@PathVariable String id) {
        ResourceResponseDTO resource = resourceService.getResourceById(id);
        ApiResponse<ResourceResponseDTO> response = new ApiResponse<>(true, "Resource fetched successfully", resource);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> updateResource(
            @PathVariable String id, @Valid @RequestBody ResourceRequestDTO requestDTO) {
        ResourceResponseDTO updatedResource = resourceService.updateResource(id, requestDTO);
        ApiResponse<ResourceResponseDTO> response = new ApiResponse<>(true, "Resource updated successfully", updatedResource);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        List<ResourceResponseDTO> resources = resourceService.searchResources(type, capacity, location, status);
        ApiResponse<List<ResourceResponseDTO>> response = new ApiResponse<>(true, "Resources search completed", resources);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ResourceStatsDTO>> getResourceStats() {
        ResourceStatsDTO stats = resourceService.getResourceStats();
        ApiResponse<ResourceStatsDTO> response = new ApiResponse<>(true, "Statistics retrieved", stats);
        return ResponseEntity.ok(response);
    }
}
