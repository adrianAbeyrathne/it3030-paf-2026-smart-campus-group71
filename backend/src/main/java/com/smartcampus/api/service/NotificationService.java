package com.smartcampus.api.service;

import com.smartcampus.api.dto.NotificationResponseDTO;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Notification;
import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.NotificationType;
import com.smartcampus.api.model.enums.UserRole;
import com.smartcampus.api.repository.NotificationRepository;
import com.smartcampus.api.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponseDTO createNotification(
            String userId, NotificationType type, String title, String message, String relatedEntityId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    /** Notify all users with ADMIN role */
    public void notifyAllAdmins(NotificationType type, String title, String message, String relatedEntityId) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        logger.info("Found {} admins to notify for event: {}", admins.size(), title);
        
        if (admins.isEmpty()) {
            logger.warn("No ADMIN users found in database! Notifications will not be delivered.");
        }

        admins.forEach(admin -> {
            logger.info("Delivering notification to Admin: {}", admin.getEmail());
            createNotification(admin.getId(), type, title, message, relatedEntityId);
        });
    }

    public List<NotificationResponseDTO> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponseDTO markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for user: " + userId);
        }
        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    public int markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for user: " + userId);
        }
        notificationRepository.delete(notification);
    }

    private NotificationResponseDTO mapToResponse(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .relatedEntityId(notification.getRelatedEntityId())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
