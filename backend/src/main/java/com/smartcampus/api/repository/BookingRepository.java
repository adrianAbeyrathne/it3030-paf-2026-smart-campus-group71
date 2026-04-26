package com.smartcampus.api.repository;

import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.enums.BookingStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, BookingStatus status);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByResourceIdAndBookingDateOrderByStartTimeAsc(String resourceId, LocalDate bookingDate);
}
