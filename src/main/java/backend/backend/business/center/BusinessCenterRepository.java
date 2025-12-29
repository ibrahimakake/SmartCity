package backend.backend.business.center;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessCenterRepository extends JpaRepository<BusinessCenter, UUID> {

    List<BusinessCenter> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
}
