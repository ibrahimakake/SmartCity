package backend.backend.tourism.hotel;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    //  VIEW: tourists can view
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    //  VIEW: tourists can view
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable UUID id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    // VIEW: tourists can view
    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> searchHotels(@RequestParam String query) {
        return ResponseEntity.ok(hotelService.searchHotels(query));
    }

    //  ADMIN ONLY: create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@Valid @RequestBody Hotel hotel) {
        Hotel createdHotel = hotelService.createHotel(hotel);
        return ResponseEntity.created(URI.create("/api/hotels/" + createdHotel.getId()))
                .body(createdHotel);
    }

    //  ADMIN ONLY: update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(
            @PathVariable UUID id,
            @Valid @RequestBody Hotel hotelDetails) {
        return ResponseEntity.ok(hotelService.updateHotel(id, hotelDetails));
    }

    //  ADMIN ONLY: delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable UUID id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
