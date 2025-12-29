package backend.backend.tourism.restaurant;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Restaurant getRestaurantById(UUID id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
    }

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurant(UUID id, Restaurant details) {
        return restaurantRepository.findById(id)
                .map(r -> {
                    r.setName(details.getName());
                    r.setAddress(details.getAddress());
                    r.setRating(details.getRating());
                    r.setPriceRange(details.getPriceRange());
                    r.setDescription(details.getDescription());
                    r.setCuisineType(details.getCuisineType());
                    r.setContactNumber(details.getContactNumber());
                    return restaurantRepository.save(r);
                })
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
    }

    @Transactional
    public void deleteRestaurant(UUID id) {
        restaurantRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> searchRestaurants(String query) {
        return restaurantRepository
                .findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(
                        query, query, query
                );
    }
}
