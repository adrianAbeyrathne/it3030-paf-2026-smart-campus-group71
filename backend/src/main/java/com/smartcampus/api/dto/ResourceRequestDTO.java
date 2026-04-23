package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    @NotNull(message = "Availability windows are required")
    @NotEmpty(message = "Availability windows cannot be empty")
    private List<@NotBlank(message = "Availability window value cannot be blank") String> availabilityWindows;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
