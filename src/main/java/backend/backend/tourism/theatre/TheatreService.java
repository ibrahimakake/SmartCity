package backend.backend.tourism.theatre;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TheatreService {

    private final TheatreRepository theatreRepository;

    @Transactional(readOnly = true)
    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Theatre getTheatreById(UUID id) {
        return theatreRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Theatre not found"));
    }

    @Transactional
    public Theatre createTheatre(Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    @Transactional
    public Theatre updateTheatre(UUID id, Theatre details) {
        return theatreRepository.findById(id)
                .map(theatre -> {
                    // Basic information
                    theatre.setName(details.getName());
                    theatre.setAddress(details.getAddress());
                    theatre.setDescription(details.getDescription());
                    
                    // Contact information
                    theatre.setContactNumber(details.getContactNumber());
                    
                    // Rating
                    theatre.setRating(details.getRating());
                    
                    // Image URL
                    theatre.setImageUrl(details.getImageUrl());
                    
                    return theatreRepository.save(theatre);
                })
                .orElseThrow(() -> new EntityNotFoundException("Theatre not found"));
    }

    @Transactional
    public void deleteTheatre(UUID id) {
        theatreRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Theatre> searchTheatres(String query) {
        return theatreRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }
}
