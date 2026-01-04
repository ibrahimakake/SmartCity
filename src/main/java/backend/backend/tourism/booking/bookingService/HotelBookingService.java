package backend.backend.tourism.booking.bookingService;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.core.user.user_repository.TouristProfileRepository;
import backend.backend.enums.BookingStatus;
import backend.backend.tourism.booking.bookingEntity.HotelBooking;
import backend.backend.tourism.booking.bookingRepository.HotelBookingRepository;
import backend.backend.tourism.booking.dto.HotelBookingRequest;
import backend.backend.tourism.hotel.Hotel;
import backend.backend.tourism.hotel.HotelRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HotelBookingService {

    private final HotelBookingRepository hotelBookingRepository;
    private final TouristProfileRepository touristProfileRepository;
    private final HotelRepository hotelRepository;

    @Transactional
    public HotelBooking createBooking(HotelBookingRequest request) {

        // ✅ simple date logic check
        if (request.getCheckOutDate().isBefore(request.getCheckInDate())
                || request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        TouristProfile profile = touristProfileRepository.findById(request.getTouristProfileId())
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found"));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found"));

        HotelBooking booking = new HotelBooking();
        booking.setTouristProfile(profile);
        booking.setHotel(hotel);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setTotalPrice(BigDecimal.valueOf(request.getTotalPrice()));
        // status/bookingDate handled by @PrePersist
        return hotelBookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(UUID bookingId) {
        HotelBooking booking = hotelBookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        hotelBookingRepository.save(booking); // ✅ explicit
    }

    @Transactional(readOnly = true)
    public java.util.List<HotelBooking> getBookingsByTouristProfileId(UUID touristProfileId) {
        return hotelBookingRepository.findByTouristProfileId(touristProfileId);
    }

    @Transactional(readOnly = true)
    public HotelBooking getBookingById(UUID bookingId) {
        return hotelBookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
    }
}
