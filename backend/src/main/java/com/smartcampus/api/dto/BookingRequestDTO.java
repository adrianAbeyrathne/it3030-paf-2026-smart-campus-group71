package com.smartcampus.api.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
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
public class BookingRequestDTO {

    @NotBlank(message = "resourceId is required")
    private String resourceId;

    @NotNull(message = "bookingDate is required")
    @FutureOrPresent(message = "bookingDate must be today or a future date")
    private LocalDate bookingDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotBlank(message = "purpose is required")
    private String purpose;

    @Min(value = 1, message = "expectedAttendees must be at least 1")
    private Integer expectedAttendees;
}
