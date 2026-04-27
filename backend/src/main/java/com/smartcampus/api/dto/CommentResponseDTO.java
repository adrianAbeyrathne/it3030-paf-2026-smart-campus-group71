package com.smartcampus.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDTO {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
