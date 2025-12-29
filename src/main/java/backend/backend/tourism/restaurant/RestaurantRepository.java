package backend.backend.tourism.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    List<Restaurant> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(
            String name, String address, String cuisineType
    );
}
