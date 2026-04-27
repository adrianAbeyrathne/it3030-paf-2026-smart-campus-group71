package com.smartcampus.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "ticket_comments")
public class TicketComment extends BaseDocument {
    @Id
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String content;
}
