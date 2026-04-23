package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.NotificationType;
import java.time.LocalDateTime;
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
public class NotificationResponseDTO {

    private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private String relatedEntityId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
