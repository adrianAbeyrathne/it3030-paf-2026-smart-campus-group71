package com.smartcampus.api.repository;

import com.smartcampus.api.model.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsRead(String userId, boolean isRead);

    long countByUserIdAndIsRead(String userId, boolean isRead);
}
