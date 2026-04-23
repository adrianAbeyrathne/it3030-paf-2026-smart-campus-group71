package com.smartcampus.api.config;

import com.smartcampus.api.model.Notification;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.AuthProvider;
import com.smartcampus.api.model.enums.NotificationType;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import com.smartcampus.api.model.enums.UserRole;
import com.smartcampus.api.repository.NotificationRepository;
import com.smartcampus.api.repository.ResourceRepository;
import com.smartcampus.api.repository.UserRepository;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationRepository notificationRepository;

    public DataSeeder(
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAdminUser();
        seedResources();
        seedNotifications();
    }

    private void seedAdminUser() {
        userRepository.findByEmail("admin@sliit.lk").orElseGet(() -> userRepository.save(User.builder()
                .email("admin@sliit.lk")
                .name("Admin User")
                .role(UserRole.ADMIN)
                .provider(AuthProvider.LOCAL)
                .password(null)
                .profilePicture(null)
                .build()));
    }

    private void seedResources() {
        if (resourceRepository.count() > 0) {
            return;
        }

        List<Resource> resources = List.of(
                Resource.builder()
                        .name("A-101 Lecture Hall")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(120)
                        .location("Block A - Floor 1")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 08:00-17:00"))
                        .description("Primary lecture hall with projector")
                        .build(),
                Resource.builder()
                        .name("Networking Lab")
                        .type(ResourceType.LAB)
                        .capacity(40)
                        .location("Engineering Building - Lab Wing")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Sat 09:00-18:00"))
                        .description("Hands-on networking equipment lab")
                        .build(),
                Resource.builder()
                        .name("Senate Meeting Room")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(20)
                        .location("Admin Block - Floor 2")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 09:00-16:00"))
                        .description("Executive meetings and planning sessions")
                        .build(),
                Resource.builder()
                        .name("Portable PA System")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(1)
                        .location("Media Unit Store")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 08:30-17:00"))
                        .description("Portable sound system for events")
                        .build(),
                Resource.builder()
                        .name("Innovation Studio")
                        .type(ResourceType.LAB)
                        .capacity(30)
                        .location("Innovation Center - Floor 3")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Sun 10:00-20:00"))
                        .description("Collaborative prototyping space")
                        .build());

        resourceRepository.saveAll(resources);
    }

    private void seedNotifications() {
        if (!notificationRepository.findByUserIdOrderByCreatedAtDesc("user123").isEmpty()) {
            return;
        }

        List<Notification> notifications = List.of(
                Notification.builder()
                        .userId("user123")
                        .title("Booking Approved")
                        .message("Your booking for A-101 Lecture Hall has been approved.")
                        .type(NotificationType.BOOKING_APPROVED)
                        .relatedEntityId("booking-1001")
                        .isRead(false)
                        .build(),
                Notification.builder()
                        .userId("user123")
                        .title("Ticket Updated")
                        .message("Your maintenance ticket status has changed to IN_PROGRESS.")
                        .type(NotificationType.TICKET_STATUS_CHANGED)
                        .relatedEntityId("ticket-2207")
                        .isRead(false)
                        .build(),
                Notification.builder()
                        .userId("user123")
                        .title("New Comment")
                        .message("A new comment was added to your support request.")
                        .type(NotificationType.NEW_COMMENT)
                        .relatedEntityId("ticket-2207")
                        .isRead(false)
                        .build());

        notificationRepository.saveAll(notifications);
    }
}
