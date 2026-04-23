package com.smartcampus.api.model;

import com.smartcampus.api.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification extends BaseDocument {

    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    @Builder.Default
    private boolean isRead = false;
    private String relatedEntityId;
}
