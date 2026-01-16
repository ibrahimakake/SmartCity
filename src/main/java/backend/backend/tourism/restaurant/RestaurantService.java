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
                .map(restaurant -> {
                    // Basic information
                    restaurant.setName(details.getName());
                    restaurant.setAddress(details.getAddress());
                    restaurant.setDescription(details.getDescription());
                    
                    // Contact information
                    restaurant.setContactNumber(details.getContactNumber());
                    
                    // Ratings and pricing
                    restaurant.setStarRating(details.getStarRating());
                    restaurant.setRating(details.getRating());
                    restaurant.setPriceRange(details.getPriceRange());
                    
                    // Additional details
                    restaurant.setCuisineType(details.getCuisineType());
                    restaurant.setImageUrl(details.getImageUrl());
                    
                    return restaurantRepository.save(restaurant);
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
