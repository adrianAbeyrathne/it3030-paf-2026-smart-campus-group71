package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private ResourceStatus status;
    private List<String> availabilityWindows;
    private String description;
    private String typeLabel;
    private String statusLabel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
