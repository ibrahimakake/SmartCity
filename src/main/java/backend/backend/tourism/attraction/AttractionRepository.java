package backend.backend.tourism.attraction;

import backend.backend.tourism.attraction.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, UUID> {

    List<Attraction> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
}
