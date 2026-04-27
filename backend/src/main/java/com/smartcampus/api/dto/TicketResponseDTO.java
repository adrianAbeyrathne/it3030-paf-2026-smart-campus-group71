package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.TicketCategory;
import com.smartcampus.api.model.enums.TicketPriority;
import com.smartcampus.api.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponseDTO {
    private String id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String resourceId;
    private String location;
    private String reporterId;
    private String reporterName;
    private String assignedToId;
    private String assignedToName;
    private String contactDetails;
    private List<String> images;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
