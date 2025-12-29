package backend.backend.business.business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {

    List<Business> findByNameContainingIgnoreCase(String keyword);

    List<Business> findBySectorIgnoreCase(String sector);
}
