package backend.backend.tourism.booking.bookingRepository;

import backend.backend.tourism.booking.bookingEntity.TheatreBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TheatreBookingRepository extends JpaRepository<TheatreBooking, UUID> {
    java.util.List<TheatreBooking> findByTouristProfileId(UUID touristProfileId);
}
