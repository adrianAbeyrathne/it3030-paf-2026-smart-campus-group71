package com.smartcampus.api.controller;

import com.smartcampus.api.dto.ApiResponse;
import com.smartcampus.api.dto.NotificationResponseDTO;
import com.smartcampus.api.service.NotificationService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private static final String USER_ID = "user123";

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getAllNotifications() {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsForUser(USER_ID);
        ApiResponse<List<NotificationResponseDTO>> response =
                new ApiResponse<>(true, "Notifications fetched successfully", notifications);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long unreadCount = notificationService.getUnreadCount(USER_ID);
        ApiResponse<Map<String, Long>> response =
                new ApiResponse<>(true, "Unread count fetched successfully", Map.of("unreadCount", unreadCount));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsRead(@PathVariable String id) {
        NotificationResponseDTO notification = notificationService.markAsRead(id, USER_ID);
        ApiResponse<NotificationResponseDTO> response =
                new ApiResponse<>(true, "Notification marked as read", notification);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead() {
        int updatedCount = notificationService.markAllAsRead(USER_ID);
        ApiResponse<Map<String, Integer>> response =
                new ApiResponse<>(true, "All notifications marked as read", Map.of("updatedCount", updatedCount));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id, USER_ID);
        ApiResponse<Void> response = new ApiResponse<>(true, "Notification deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
