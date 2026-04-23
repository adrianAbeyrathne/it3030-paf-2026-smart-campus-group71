package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class NotificationRequestDTO {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @Size(max = 100, message = "Related entity ID cannot exceed 100 characters")
    private String relatedEntityId;
}
