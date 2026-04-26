package com.smartcampus.api.controller;

import com.smartcampus.api.dto.ApiResponse;
import com.smartcampus.api.dto.BookingRequestDTO;
import com.smartcampus.api.dto.BookingResponseDTO;
import com.smartcampus.api.dto.BookingReviewRequestDTO;
import com.smartcampus.api.model.enums.BookingStatus;
import com.smartcampus.api.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** POST /api/bookings – create a booking for the authenticated user */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO requestDTO,
            Authentication auth) {
        String userId = resolveUserId(auth);
        BookingResponseDTO booking = bookingService.createBooking(requestDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Booking request created successfully", booking));
    }

    /** GET /api/bookings/my – current user's own bookings */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            Authentication auth) {
        String userId = resolveUserId(auth);
        List<BookingResponseDTO> bookings = bookingService.getMyBookings(userId, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bookings fetched successfully", bookings));
    }

    /** GET /api/bookings – all bookings (ADMIN only) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            Authentication auth) {
        if (!isAdmin(auth)) {
            throw new ValidationException("Only ADMIN users can view all bookings");
        }
        List<BookingResponseDTO> bookings = bookingService.getAllBookings(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "All bookings fetched successfully", bookings));
    }

    /** PUT /api/bookings/{id}/review – approve or reject (ADMIN only) */
    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> reviewBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingReviewRequestDTO requestDTO,
            Authentication auth) {
        if (!isAdmin(auth)) {
            throw new ValidationException("Only ADMIN users can review bookings");
        }
        String reviewerUserId = resolveUserId(auth);
        BookingResponseDTO booking = bookingService.reviewBooking(id, requestDTO, reviewerUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking reviewed successfully", booking));
    }

    /** PUT /api/bookings/{id}/cancel – cancel an approved booking */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable String id,
            Authentication auth) {
        String userId    = resolveUserId(auth);
        boolean isAdmin  = isAdmin(auth);
        BookingResponseDTO booking = bookingService.cancelBooking(id, userId, isAdmin);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled successfully", booking));
    }

    // ── helpers ────────────────────────────────────────────────────
    private String resolveUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof String userId) {
            return userId;
        }
        return "user123";
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
