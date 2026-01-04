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
                    hotel.setName(hotelDetails.getName());
                    hotel.setAddress(hotelDetails.getAddress());
                    hotel.setRating(hotelDetails.getRating());
                    hotel.setMinPrice(hotelDetails.getMinPrice());
                    hotel.setMaxPrice(hotelDetails.getMaxPrice());
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
