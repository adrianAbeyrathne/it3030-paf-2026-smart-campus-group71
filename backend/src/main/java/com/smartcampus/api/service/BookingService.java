package com.smartcampus.api.service;

import com.smartcampus.api.dto.BookingRequestDTO;
import com.smartcampus.api.dto.BookingResponseDTO;
import com.smartcampus.api.dto.BookingReviewRequestDTO;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.BookingStatus;
import com.smartcampus.api.model.enums.NotificationType;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import com.smartcampus.api.repository.UserRepository;
import jakarta.validation.ValidationException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO, String userId) {
        validateTimeRange(requestDTO.getStartTime().toString(), requestDTO.getEndTime().toString());

        Resource resource = resourceRepository
                .findById(requestDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + requestDTO.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ValidationException("Selected resource is not active for booking");
        }

        validateConflict(null, requestDTO.getResourceId(), requestDTO.getBookingDate().toString(),
                requestDTO.getStartTime().toString(), requestDTO.getEndTime().toString());

        Booking booking = Booking.builder()
                .userId(userId)
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .bookingDate(requestDTO.getBookingDate())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .purpose(requestDTO.getPurpose())
                .expectedAttendees(requestDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Notify Admins about the new request
        User teacher = userRepository.findById(userId).orElse(null);
        String teacherName = teacher != null ? teacher.getName() : "A teacher";
        notificationService.notifyAllAdmins(
                NotificationType.BOOKING_REQUESTED,
                "New Booking Request",
                teacherName + " has requested " + resource.getName() + " for " + saved.getBookingDate(),
                saved.getId());

        return mapToResponse(saved);
    }

    public List<BookingResponseDTO> getMyBookings(String userId, BookingStatus status) {
        List<Booking> bookings = status == null
                ? bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getAllBookings(BookingStatus status) {
        List<Booking> bookings = status == null
                ? bookingRepository.findAllByOrderByCreatedAtDesc()
                : bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BookingResponseDTO reviewBooking(String bookingId, BookingReviewRequestDTO requestDTO, String reviewerUserId) {
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be reviewed");
        }

        if (requestDTO.getStatus() != BookingStatus.APPROVED && requestDTO.getStatus() != BookingStatus.REJECTED) {
            throw new ValidationException("Review status must be APPROVED or REJECTED");
        }

        if (requestDTO.getStatus() == BookingStatus.REJECTED
                && (requestDTO.getReason() == null || requestDTO.getReason().trim().isEmpty())) {
            throw new ValidationException("Rejection reason is required");
        }

        if (requestDTO.getStatus() == BookingStatus.APPROVED) {
            validateConflict(
                    booking.getId(),
                    booking.getResourceId(),
                    booking.getBookingDate().toString(),
                    booking.getStartTime().toString(),
                    booking.getEndTime().toString());
        }

        booking.setStatus(requestDTO.getStatus());
        booking.setReviewReason(requestDTO.getReason());
        booking.setReviewedBy(reviewerUserId);
        booking.setReviewedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);

        if (updated.getStatus() == BookingStatus.APPROVED) {
            notificationService.createNotification(
                    updated.getUserId(),
                    NotificationType.BOOKING_APPROVED,
                    "Booking Approved",
                    "Your booking for " + updated.getResourceName() + " has been approved.",
                    updated.getId());
        } else if (updated.getStatus() == BookingStatus.REJECTED) {
            String reason = updated.getReviewReason() == null || updated.getReviewReason().isBlank()
                    ? "No reason provided"
                    : updated.getReviewReason();
            
            // Send notification BEFORE deleting
            notificationService.createNotification(
                    updated.getUserId(),
                    NotificationType.BOOKING_REJECTED,
                    "Booking Rejected",
                    "Your booking for " + updated.getResourceName() + " was rejected. Reason: " + reason,
                    null); // Entity will be gone

            // Delete the card (booking record) as requested
            bookingRepository.deleteById(updated.getId());
            return null; // Return null to indicate deletion
        }

        return mapToResponse(updated);
    }

    public BookingResponseDTO cancelBooking(String bookingId, String actorUserId, boolean adminAction) {
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Only APPROVED bookings can be cancelled");
        }

        if (!adminAction && !booking.getUserId().equals(actorUserId)) {
            throw new ValidationException("You can only cancel your own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setReviewedBy(actorUserId);
        booking.setReviewedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);

        notificationService.createNotification(
                updated.getUserId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + updated.getResourceName() + " has been cancelled.",
                updated.getId());

        return mapToResponse(updated);
    }

    private void validateConflict(String bookingId, String resourceId, String bookingDate, String startTime, String endTime) {
        List<Booking> sameDayBookings = bookingRepository.findByResourceIdAndBookingDateOrderByStartTimeAsc(
                resourceId,
                java.time.LocalDate.parse(bookingDate));

        for (Booking existing : sameDayBookings) {
            if (bookingId != null && bookingId.equals(existing.getId())) {
                continue;
            }

            if (existing.getStatus() == BookingStatus.REJECTED || existing.getStatus() == BookingStatus.CANCELLED) {
                continue;
            }

            if (isOverlapping(
                    startTime,
                    endTime,
                    existing.getStartTime().toString(),
                    existing.getEndTime().toString())) {
                throw new ValidationException(
                        "Booking conflict detected for resource "
                                + existing.getResourceName()
                                + " between "
                                + existing.getStartTime()
                                + " and "
                                + existing.getEndTime());
            }
        }
    }

    private boolean isOverlapping(String startA, String endA, String startB, String endB) {
        java.time.LocalTime aStart = java.time.LocalTime.parse(startA);
        java.time.LocalTime aEnd = java.time.LocalTime.parse(endA);
        java.time.LocalTime bStart = java.time.LocalTime.parse(startB);
        java.time.LocalTime bEnd = java.time.LocalTime.parse(endB);

        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    private void validateTimeRange(String startTime, String endTime) {
        java.time.LocalTime start = java.time.LocalTime.parse(startTime);
        java.time.LocalTime end = java.time.LocalTime.parse(endTime);

        if (!start.isBefore(end)) {
            throw new ValidationException("startTime must be before endTime");
        }
    }

    public List<BookingResponseDTO> getDailySchedule(String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            return bookingRepository.findByBookingDate(localDate).stream()
                    .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching schedule for date {}: {}", date, e.getMessage());
            return List.of(); // Return empty instead of 500
        }
    }

    public List<BookingResponseDTO> getResourceSchedule(String resourceId, String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            return bookingRepository.findByResourceIdAndBookingDateOrderByStartTimeAsc(resourceId, localDate)
                    .stream()
                    .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .reviewReason(booking.getReviewReason())
                .reviewedBy(booking.getReviewedBy())
                .reviewedAt(booking.getReviewedAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
