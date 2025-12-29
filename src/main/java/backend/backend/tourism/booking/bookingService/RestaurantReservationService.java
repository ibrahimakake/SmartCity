package backend.backend.tourism.booking.bookingService;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.core.user.user_repository.TouristProfileRepository;
import backend.backend.enums.ReservationStatus;
import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import backend.backend.tourism.booking.bookingRepository.RestaurantReservationRepository;
import backend.backend.tourism.booking.dto.RestaurantReservationRequest;
import backend.backend.tourism.restaurant.Restaurant;
import backend.backend.tourism.restaurant.RestaurantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantReservationService {

    private final RestaurantReservationRepository reservationRepository;
    private final TouristProfileRepository touristProfileRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public RestaurantReservation createReservation(RestaurantReservationRequest request) {
        LocalDateTime reservationDateTime = LocalDateTime.of(
            request.getReservationDate(), 
            request.getReservationTime()
        );
        
        if (reservationDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reservation date and time must be in the future");
        }

        TouristProfile profile = touristProfileRepository.findById(request.getTouristProfileId())
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        // Check for existing reservation using the repository method
        boolean exists = reservationRepository.existsByRestaurantIdAndReservationDateAndReservationTime(
                request.getRestaurantId(),
                request.getReservationDate(),
                request.getReservationTime()
        );

        if (exists) {
            throw new IllegalStateException("Restaurant already booked at the requested time");
        }

        RestaurantReservation reservation = new RestaurantReservation();
        reservation.setTouristProfile(profile);
        reservation.setRestaurant(restaurant);
        reservation.setReservationDate(request.getReservationDate());
        reservation.setReservationTime(request.getReservationTime());
        // Status is set to CONFIRMED by default in the entity

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public RestaurantReservation getReservationById(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<RestaurantReservation> getReservationsByTouristProfile(UUID touristProfileId) {
        return reservationRepository.findByTouristProfileId(touristProfileId);
    }

    @Transactional(readOnly = true)
    public List<RestaurantReservation> getUpcomingReservationsByTouristProfile(UUID touristProfileId) {
        return reservationRepository.findUpcomingReservationsByTouristProfile(touristProfileId);
    }

    @Transactional(readOnly = true)
    public List<RestaurantReservation> getReservationsByRestaurant(UUID restaurantId) {
        return reservationRepository.findByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<RestaurantReservation> getReservationsByRestaurantAndDate(UUID restaurantId, LocalDate date) {
        return reservationRepository.findByRestaurantAndDate(restaurantId, date);
    }

    @Transactional
    public RestaurantReservation updateReservationStatus(UUID reservationId, ReservationStatus newStatus) {
        RestaurantReservation reservation = getReservationById(reservationId);
        reservation.setStatus(newStatus);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(UUID reservationId) {
        updateReservationStatus(reservationId, ReservationStatus.CANCELLED);
    }
    
    @Transactional
    public void confirmReservation(UUID reservationId) {
        updateReservationStatus(reservationId, ReservationStatus.CONFIRMED);
    }
}
