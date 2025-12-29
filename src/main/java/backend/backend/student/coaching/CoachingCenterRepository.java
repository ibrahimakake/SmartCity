package backend.backend.student.coaching;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CoachingCenterRepository extends JpaRepository<CoachingCenter, UUID> {

    List<CoachingCenter> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrSpecializationContainingIgnoreCase(
            String name, String address, String specialization
    );
}
