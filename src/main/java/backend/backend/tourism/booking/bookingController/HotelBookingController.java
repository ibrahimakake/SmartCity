package backend.backend.tourism.booking.bookingController;

import backend.backend.tourism.booking.bookingEntity.HotelBooking;
import backend.backend.tourism.booking.bookingService.HotelBookingService;
import backend.backend.tourism.booking.dto.HotelBookingRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/hotel-bookings")
@RequiredArgsConstructor
public class HotelBookingController {

    private final HotelBookingService hotelBookingService;

    @PostMapping
    public ResponseEntity<HotelBooking> createBooking(@Valid @RequestBody HotelBookingRequest request) {
        HotelBooking created = hotelBookingService.createBooking(request);
        return ResponseEntity.created(URI.create("/api/hotel-bookings/" + created.getId()))
                .body(created);
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID bookingId) {
        hotelBookingService.cancelBooking(bookingId);
        return ResponseEntity.noContent().build(); // ✅ better REST
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<HotelBooking> getBooking(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(hotelBookingService.getBookingById(bookingId));
    }
}
