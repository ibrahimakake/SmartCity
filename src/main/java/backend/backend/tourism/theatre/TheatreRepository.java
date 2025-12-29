package backend.backend.tourism.theatre;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TheatreRepository extends JpaRepository<Theatre, UUID> {
    List<Theatre> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
}
