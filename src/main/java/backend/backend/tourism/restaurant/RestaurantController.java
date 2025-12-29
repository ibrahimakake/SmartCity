package backend.backend.tourism.restaurant;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    //  VIEW: tourists can view
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAll() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    //  VIEW: tourists can view
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    //  VIEW: tourists can view
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> search(@RequestParam String query) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(query));
    }

    //  ADMIN ONLY: create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Restaurant> create(@Valid @RequestBody Restaurant restaurant) {
        Restaurant created = restaurantService.createRestaurant(restaurant);
        return ResponseEntity.created(URI.create("/api/restaurants/" + created.getId()))
                .body(created);
    }

    //  ADMIN ONLY: update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> update(@PathVariable UUID id, @Valid @RequestBody Restaurant details) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, details));
    }

    //  ADMIN ONLY: delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }
}
