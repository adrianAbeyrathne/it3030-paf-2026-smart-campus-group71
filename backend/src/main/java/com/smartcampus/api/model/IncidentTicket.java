package com.smartcampus.api.model;

import com.smartcampus.api.model.enums.TicketCategory;
import com.smartcampus.api.model.enums.TicketPriority;
import com.smartcampus.api.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "incident_tickets")
public class IncidentTicket extends BaseDocument {
    @Id
    private String id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    
    private String resourceId; // Optional link to a specific resource
    private String location;   // e.g. "Level 2, Room 204"
    
    private String reporterId;
    private String assignedToId;
    
    private String contactDetails;
    
    @Builder.Default
    private List<String> images = new ArrayList<>();
    private String resolutionNotes;
}
