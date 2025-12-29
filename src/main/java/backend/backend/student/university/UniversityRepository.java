package backend.backend.student.university.repository;

import backend.backend.student.university.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UniversityRepository extends JpaRepository<University, UUID> {

    // Simple search (name or address)
    List<University> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
}
