package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.TicketCategory;
import com.smartcampus.api.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Category is required")
    private TicketCategory category;
    
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
    
    private String resourceId;
    private String location;
    private String contactDetails;
}
