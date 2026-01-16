package backend.backend.tourism.hotel;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    @Transactional(readOnly = true)
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Hotel getHotelById(UUID id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found"));
    }

    @Transactional
    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @Transactional
    public Hotel updateHotel(UUID id, Hotel hotelDetails) {
        return hotelRepository.findById(id)
                .map(hotel -> {
                    // Basic info
                    hotel.setName(hotelDetails.getName());
                    hotel.setAddress(hotelDetails.getAddress());
                    hotel.setEmail(hotelDetails.getEmail());
                    hotel.setPhoneNumber(hotelDetails.getPhoneNumber());
                    hotel.setDescription(hotelDetails.getDescription());

                    // Pricing
                    hotel.setMinPrice(hotelDetails.getMinPrice());
                    hotel.setMaxPrice(hotelDetails.getMaxPrice());
                    hotel.setStartingPrice(hotelDetails.getStartingPrice());

                    // Ratings
                    hotel.setStarRating(hotelDetails.getStarRating());
                    hotel.setRating(hotelDetails.getRating());

                    // Image and status
                    hotel.setImageUrl(hotelDetails.getImageUrl());
                    hotel.setActive(hotelDetails.isActive());

                    return hotelRepository.save(hotel);
                })
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found"));
    }

    @Transactional
    public void deleteHotel(UUID id) {
        hotelRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Hotel> searchHotels(String query) {
        return hotelRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }
}