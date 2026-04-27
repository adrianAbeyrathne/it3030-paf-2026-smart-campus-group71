package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketStatusUpdateDTO {
    private TicketStatus status;
    
    private String resolutionNotes;
    private String assignedToId;
}
