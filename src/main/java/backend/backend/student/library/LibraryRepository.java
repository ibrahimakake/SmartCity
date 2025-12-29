package backend.backend.student.library;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LibraryRepository extends JpaRepository<Library, UUID> {

    List<Library> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(
            String name, String address
    );
}
