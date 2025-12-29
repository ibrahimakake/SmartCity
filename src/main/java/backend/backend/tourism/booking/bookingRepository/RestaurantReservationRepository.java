package backend.backend.tourism.booking.bookingRepository;

import backend.backend.enums.ReservationStatus;
import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantReservationRepository extends JpaRepository<RestaurantReservation, UUID> {

    // Basic CRUD operations are provided by JpaRepository
    // Custom query methods
    
    List<RestaurantReservation> findByTouristProfileId(UUID touristProfileId);
    
    List<RestaurantReservation> findByRestaurantId(UUID restaurantId);
    
    List<RestaurantReservation> findByRestaurantIdAndReservationDate(UUID restaurantId, LocalDate reservationDate);
    
    List<RestaurantReservation> findByStatus(ReservationStatus status);
    
    @Query("SELECT r FROM RestaurantReservation r WHERE r.touristProfile.id = :touristProfileId AND r.reservationDate >= CURRENT_DATE")
    List<RestaurantReservation> findUpcomingReservationsByTouristProfile(
            @Param("touristProfileId") UUID touristProfileId
    );
    
    @Query("SELECT r FROM RestaurantReservation r WHERE r.restaurant.id = :restaurantId AND r.reservationDate = :date AND r.reservationTime = :time")
    List<RestaurantReservation> findByRestaurantAndDateTime(
            @Param("restaurantId") UUID restaurantId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );
    
    default boolean existsByRestaurantIdAndReservationDateAndReservationTime(
            UUID restaurantId, 
            LocalDate reservationDate, 
            LocalTime reservationTime
    ) {
        return !findByRestaurantAndDateTime(restaurantId, reservationDate, reservationTime).isEmpty();
    }
    
    @Query("SELECT r FROM RestaurantReservation r WHERE r.restaurant.id = :restaurantId AND r.reservationDate = :date")
    List<RestaurantReservation> findByRestaurantAndDate(
            @Param("restaurantId") UUID restaurantId,
            @Param("date") LocalDate date
    );
    
    @Query("SELECT r FROM RestaurantReservation r WHERE r.touristProfile.id = :touristProfileId AND r.status = :status")
    List<RestaurantReservation> findByTouristProfileAndStatus(
            @Param("touristProfileId") UUID touristProfileId,
            @Param("status") ReservationStatus status
    );
}
