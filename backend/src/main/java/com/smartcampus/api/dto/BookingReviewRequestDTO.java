package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
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
public class BookingReviewRequestDTO {

    @NotNull(message = "status is required")
    private BookingStatus status;

    private String reason;
}
