package com.smartcampus.api.controller;

import com.smartcampus.api.dto.ApiResponse;
import com.smartcampus.api.dto.NotificationResponseDTO;
import com.smartcampus.api.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** GET /api/notifications – get all notifications for the authenticated user */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getAllNotifications(
            Authentication auth) {
        String userId = resolveUserId(auth);
        List<NotificationResponseDTO> notifications =
                notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Notifications fetched successfully", notifications));
    }

    /** GET /api/notifications/unread-count */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        String userId = resolveUserId(auth);
        long unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count fetched",
                Map.of("unreadCount", unreadCount)));
    }

    /** PUT /api/notifications/{id}/read */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsRead(
            @PathVariable String id, Authentication auth) {
        String userId = resolveUserId(auth);
        NotificationResponseDTO notification = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", notification));
    }

    /** PUT /api/notifications/mark-all-read */
    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(Authentication auth) {
        String userId = resolveUserId(auth);
        int updatedCount = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read",
                Map.of("updatedCount", updatedCount)));
    }

    /** DELETE /api/notifications/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable String id, Authentication auth) {
        String userId = resolveUserId(auth);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification deleted", null));
    }

    // ── helper: extract MongoDB userId from JWT principal, fall back to "user123" for demo ──
    private String resolveUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof String userId) {
            return userId;
        }
        return "user123"; // fallback for backward-compat / demo seeded data
    }
}
