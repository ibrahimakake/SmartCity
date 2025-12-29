package backend.backend.tourism.booking.bookingRepository;

import backend.backend.SmartCityApplication;
import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.core.user.user_entity.User;
import backend.backend.enums.Role;
import backend.backend.enums.ReservationStatus;
import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import backend.backend.tourism.restaurant.Restaurant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@ContextConfiguration(classes = SmartCityApplication.class)
class RestaurantReservationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private RestaurantReservationRepository repository;

    @Test
    void testSaveAndFindReservation() {
        // Create a new reservation
        RestaurantReservation reservation = new RestaurantReservation();
        reservation.setReservationDate(LocalDate.now().plusDays(1));
        reservation.setReservationTime(LocalTime.of(19, 0));
        reservation.setStatus(ReservationStatus.CONFIRMED);
        
        // Create and save a User with all required fields
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole(Role.TOURIST);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setUsername("testuser");
        user.setCreatedAt(LocalDateTime.now());
        user = entityManager.persistAndFlush(user);
        
        // Create and save TouristProfile
        TouristProfile touristProfile = new TouristProfile();
        touristProfile.setUser(user);
        touristProfile.setNationality("Test");
        touristProfile = entityManager.persistAndFlush(touristProfile);
        
        // Create and save Restaurant with all required fields
        Restaurant restaurant = new Restaurant();
        restaurant.setName("Test Restaurant");
        restaurant.setAddress("123 Test St, Test City");
        restaurant.setContactNumber("+1234567890");
        restaurant.setPriceRange("$$");
        restaurant = entityManager.persistAndFlush(restaurant);
        
        // Set relationships
        reservation.setTouristProfile(touristProfile);
        reservation.setRestaurant(restaurant);
        
        // Save the reservation
        RestaurantReservation saved = repository.save(reservation);
        entityManager.flush();
        entityManager.clear();
        
        // Verify
        assertNotNull(saved.getId());
        assertTrue(repository.findById(saved.getId()).isPresent());
    }
}
