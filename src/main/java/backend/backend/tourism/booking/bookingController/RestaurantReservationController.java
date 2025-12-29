package backend.backend.tourism.booking.bookingController;

import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import backend.backend.tourism.booking.bookingService.RestaurantReservationService;
import backend.backend.tourism.booking.dto.RestaurantReservationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurant-reservations")
@RequiredArgsConstructor
public class RestaurantReservationController {

    private final RestaurantReservationService reservationService;

    // ✅ TOURIST: create reservation
    @PreAuthorize("hasRole('TOURIST')")
    @PostMapping
    public ResponseEntity<RestaurantReservation> create(@Valid @RequestBody RestaurantReservationRequest request) {
        RestaurantReservation created = reservationService.createReservation(request);
        return ResponseEntity.created(URI.create("/api/restaurant-reservations/" + created.getId()))
                .body(created);
    }

    //  TOURIST (or ADMIN) can view by id (you can restrict later if you want)
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantReservation> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    // TOURIST: cancel reservation
    @PreAuthorize("hasRole('TOURIST')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }

    // TOURIST: list all reservations of a touristProfile
    @PreAuthorize("hasRole('TOURIST')")
    @GetMapping("/tourist/{touristProfileId}")
    public ResponseEntity<List<RestaurantReservation>> getByTouristProfile(@PathVariable UUID touristProfileId) {
        return ResponseEntity.ok(reservationService.getReservationsByTouristProfile(touristProfileId));
    }

    //  TOURIST: list upcoming reservations
    @PreAuthorize("hasRole('TOURIST')")
    @GetMapping("/tourist/{touristProfileId}/upcoming")
    public ResponseEntity<List<RestaurantReservation>> getUpcomingByTouristProfile(@PathVariable UUID touristProfileId) {
        return ResponseEntity.ok(reservationService.getUpcomingReservationsByTouristProfile(touristProfileId));
    }
}
