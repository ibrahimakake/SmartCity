package backend.backend.tourism.booking.bookingRepository;

import backend.backend.tourism.booking.bookingEntity.HotelBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HotelBookingRepository extends JpaRepository<HotelBooking, UUID> {
}
