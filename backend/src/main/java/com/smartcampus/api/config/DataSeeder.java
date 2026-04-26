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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationRepository notificationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final Environment environment;

    public DataSeeder(UserRepository userRepository,
                      ResourceRepository resourceRepository,
                      NotificationRepository notificationRepository,
                      org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                      Environment environment) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        String mongoUri = environment.getProperty("spring.data.mongodb.uri", "");
        if (mongoUri.contains("DB_USERNAME") || mongoUri.contains("DB_PASSWORD")) {
            logger.warn("Skipping data seeding because MongoDB credentials are placeholders.");
            return;
        }

        try {
            seedUsers();
            seedResources();
            seedNotifications();
        } catch (Exception ex) {
            logger.warn("Skipping data seeding due to MongoDB connectivity/auth issue: {}", ex.getMessage());
        }
    }

    // ── Users ──────────────────────────────────────────────────────
    private void seedUsers() {
        // Head Admin user
        User headAdmin = userRepository.findByEmail("campus.head@sliit.lk").orElse(new User());
        headAdmin.setEmail("campus.head@sliit.lk");
        headAdmin.setName("Campus Head Admin");
        headAdmin.setPassword(passwordEncoder.encode("Admin@123"));
        headAdmin.setRole(UserRole.ADMIN);
        headAdmin.setProvider(AuthProvider.LOCAL);
        userRepository.save(headAdmin);

        // Admin user (legacy)
        User admin = userRepository.findByEmail("admin@sliit.lk").orElse(new User());
        admin.setEmail("admin@sliit.lk");
        admin.setName("Admin User");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        admin.setProvider(AuthProvider.LOCAL);
        userRepository.save(admin);
        
        logger.info("Admin accounts synced and updated: campus.head@sliit.lk");

        // Demo teacher (The Tutor)
        User teacher = userRepository.findByEmail("teacher@sliit.lk").orElse(new User());
        teacher.setEmail("teacher@sliit.lk");
        teacher.setName("Professor Smith");
        teacher.setPassword(passwordEncoder.encode("teacher123"));
        teacher.setRole(UserRole.TEACHER);
        teacher.setProvider(AuthProvider.LOCAL);
        userRepository.save(teacher);
        logger.info("Teacher account synced: teacher@sliit.lk");

        // Demo regular user (simulates a Google-signed-in student)
        userRepository.findByEmail("student@sliit.lk").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("student@sliit.lk")
                        .name("John Student")
                        .role(UserRole.USER)
                        .provider(AuthProvider.GOOGLE)
                        .build()));

        // Demo technician
        userRepository.findByEmail("tech@sliit.lk").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("tech@sliit.lk")
                        .name("Jane Technician")
                        .role(UserRole.TECHNICIAN)
                        .provider(AuthProvider.GOOGLE)
                        .build()));

        logger.info("Demo users seeded.");
    }

    // ── Resources ─────────────────────────────────────────────────
    private void seedResources() {
        // Force cleanup of old/broken data to fix the 500 errors reported by user
        resourceRepository.deleteAll();
        logger.info("Cleared old resources to sync with new campus model.");

        List<Resource> resources = List.of(
                Resource.builder()
                        .name("L606 Lecture Hall")
                        .type(ResourceType.STUDIES)
                        .capacity(120)
                        .location("L606")
                        .status(ResourceStatus.NOT_ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 08:00-17:00"))
                        .description("High-capacity lecture hall for general studies.")
                        .build(),
                Resource.builder()
                        .name("G606 Presentation Suite")
                        .type(ResourceType.PRESENTATION)
                        .capacity(60)
                        .location("G606")
                        .status(ResourceStatus.NOT_ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 08:00-17:00"))
                        .description("Modern suite for student presentations and seminars.")
                        .build(),
                Resource.builder()
                        .name("Networking Lab")
                        .type(ResourceType.LAB_WORK)
                        .capacity(40)
                        .location("LAB_POLE")
                        .status(ResourceStatus.ACTIVE)
                        .availabilityWindows(List.of("Mon-Sat 09:00-18:00"))
                        .description("Hands-on networking equipment lab - Currently Occupied.")
                        .build(),
                Resource.builder()
                        .name("IT Wing Computer Lab")
                        .type(ResourceType.COMPUTER_LAB)
                        .capacity(50)
                        .location("IT_WING")
                        .status(ResourceStatus.NOT_ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 09:00-20:00"))
                        .description("Equipped with latest workstations for programming.")
                        .build(),
                Resource.builder()
                        .name("Senate Meeting Room")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(20)
                        .location("MAIN_BUILDING")
                        .status(ResourceStatus.OUT_OF_SERVICE)
                        .availabilityWindows(List.of("Mon-Fri 09:00-16:00"))
                        .description("Maintenance in progress - Under Renovation.")
                        .build(),
                Resource.builder()
                        .name("Portable PA System")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(1)
                        .location("MAIN_BUILDING")
                        .status(ResourceStatus.NOT_ACTIVE)
                        .availabilityWindows(List.of("Mon-Fri 08:30-17:00"))
                        .description("Portable sound system for events.")
                        .build());

        resourceRepository.saveAll(resources);
        logger.info("Resources seeded: {} resources", resources.size());
    }

    // ── Notifications ─────────────────────────────────────────────
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
        logger.info("Notifications seeded.");
    }
}
