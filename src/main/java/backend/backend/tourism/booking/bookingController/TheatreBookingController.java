package backend.backend.tourism.booking.bookingController;

import backend.backend.tourism.booking.bookingEntity.TheatreBooking;
import backend.backend.tourism.booking.bookingService.TheatreBookingService;
import backend.backend.tourism.booking.dto.TheatreBookingRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/theatre-bookings")
@RequiredArgsConstructor
public class TheatreBookingController {

    private final TheatreBookingService theatreBookingService;

    @PostMapping
    public ResponseEntity<TheatreBooking> create(@Valid @RequestBody TheatreBookingRequest request) {
        TheatreBooking created = theatreBookingService.createBooking(request);
        return ResponseEntity.created(URI.create("/api/theatre-bookings/" + created.getId()))
                .body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheatreBooking> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(theatreBookingService.getById(id));
    }

    // TOURIST: list all bookings of a touristProfile
    @GetMapping("/tourist/{touristProfileId}")
    public ResponseEntity<java.util.List<TheatreBooking>> getByTouristProfile(@PathVariable UUID touristProfileId) {
        return ResponseEntity.ok(theatreBookingService.getBookingsByTouristProfileId(touristProfileId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        theatreBookingService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
