package com.smartcampus.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.api.dto.ResourceRequestDTO;
import com.smartcampus.api.dto.ResourceResponseDTO;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import com.smartcampus.api.repository.ResourceRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository repository;

    @InjectMocks
    private ResourceService service;

    private ResourceRequestDTO requestDTO;
    private Resource resource;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @BeforeEach
    void setUp() {
        createdAt = LocalDateTime.of(2026, 4, 25, 9, 0);
        updatedAt = LocalDateTime.of(2026, 4, 25, 10, 0);

        requestDTO = ResourceRequestDTO.builder()
                .name("Main Lecture Hall")
                .type(ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Block A")
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows(List.of("08:00-12:00", "13:00-17:00"))
                .description("Primary lecture venue")
                .build();

        resource = Resource.builder()
                .id("res-1")
                .name("Main Lecture Hall")
                .type(ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Block A")
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows(List.of("08:00-12:00", "13:00-17:00"))
                .description("Primary lecture venue")
                .build();
        resource.setCreatedAt(createdAt);
        resource.setUpdatedAt(updatedAt);
    }

    @Test
    void testCreateResource_Success() {
        when(repository.save(org.mockito.ArgumentMatchers.any(Resource.class))).thenReturn(resource);

        ResourceResponseDTO result = service.createResource(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("res-1");
        assertThat(result.getName()).isEqualTo(requestDTO.getName());
        assertThat(result.getType()).isEqualTo(requestDTO.getType());
        assertThat(result.getCapacity()).isEqualTo(requestDTO.getCapacity());
        assertThat(result.getLocation()).isEqualTo(requestDTO.getLocation());
        assertThat(result.getStatus()).isEqualTo(requestDTO.getStatus());
        assertThat(result.getAvailabilityWindows()).containsExactlyElementsOf(requestDTO.getAvailabilityWindows());
        assertThat(result.getDescription()).isEqualTo(requestDTO.getDescription());
        assertThat(result.getCreatedAt()).isEqualTo(createdAt);
        assertThat(result.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void testGetResourceById_Success() {
        when(repository.findById("res-1")).thenReturn(Optional.of(resource));

        ResourceResponseDTO result = service.getResourceById("res-1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("res-1");
        assertThat(result.getName()).isEqualTo("Main Lecture Hall");
        assertThat(result.getType()).isEqualTo(ResourceType.LECTURE_HALL);
        assertThat(result.getCapacity()).isEqualTo(120);
    }

    @Test
    void testGetResourceById_NotFound() {
        when(repository.findById("missing-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getResourceById("missing-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing-id");
    }

    @Test
    void testUpdateResource_Success() {
        ResourceRequestDTO updateRequest = ResourceRequestDTO.builder()
                .name("Updated Lecture Hall")
                .type(ResourceType.MEETING_ROOM)
                .capacity(80)
                .location("Block B")
                .status(ResourceStatus.OUT_OF_SERVICE)
                .availabilityWindows(List.of("09:00-11:00"))
                .description("Under maintenance")
                .build();

        Resource updatedResource = Resource.builder()
                .id("res-1")
                .name(updateRequest.getName())
                .type(updateRequest.getType())
                .capacity(updateRequest.getCapacity())
                .location(updateRequest.getLocation())
                .status(updateRequest.getStatus())
                .availabilityWindows(updateRequest.getAvailabilityWindows())
                .description(updateRequest.getDescription())
                .build();
        updatedResource.setCreatedAt(createdAt);
        updatedResource.setUpdatedAt(updatedAt);

        when(repository.findById("res-1")).thenReturn(Optional.of(resource));
        when(repository.save(resource)).thenReturn(updatedResource);

        ResourceResponseDTO result = service.updateResource("res-1", updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("res-1");
        assertThat(result.getName()).isEqualTo("Updated Lecture Hall");
        assertThat(result.getType()).isEqualTo(ResourceType.MEETING_ROOM);
        assertThat(result.getCapacity()).isEqualTo(80);
        assertThat(result.getLocation()).isEqualTo("Block B");
        assertThat(result.getStatus()).isEqualTo(ResourceStatus.OUT_OF_SERVICE);
        assertThat(result.getAvailabilityWindows()).containsExactly("09:00-11:00");
        assertThat(result.getDescription()).isEqualTo("Under maintenance");
    }

    @Test
    void testDeleteResource_Success() {
        when(repository.findById("res-1")).thenReturn(Optional.of(resource));

        assertDoesNotThrow(() -> service.deleteResource("res-1"));

        verify(repository).delete(resource);
    }

    @Test
    void testGetAllResources_Success() {
        Resource secondResource = Resource.builder()
                .id("res-2")
                .name("Chemistry Lab")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Block C")
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows(List.of("10:00-14:00"))
                .description("Laboratory")
                .build();

        when(repository.findAll()).thenReturn(List.of(resource, secondResource));

        List<ResourceResponseDTO> result = service.getAllResources();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo("res-1");
        assertThat(result.get(1).getId()).isEqualTo("res-2");
    }
}
