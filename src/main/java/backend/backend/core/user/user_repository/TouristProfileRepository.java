package backend.backend.core.user.user_repository;

import backend.backend.core.user.user_entity.TouristProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TouristProfileRepository extends JpaRepository<TouristProfile, UUID> {

    // =========================
    // Basic lookups
    // =========================

    Optional<TouristProfile> findByUser_Id(UUID userId);

    boolean existsByUser_Id(UUID userId);

    // =========================
    // Filtering
    // =========================

    List<TouristProfile> findByNationality(String nationality);

    // =========================
    // ElementCollection queries
    // =========================

    @Query("SELECT t FROM TouristProfile t WHERE :interest MEMBER OF t.interests")
    List<TouristProfile> findByInterest(@Param("interest") String interest);

    // Optional – keep only if strictly needed
    @Query("""
           SELECT DISTINCT t
           FROM TouristProfile t
           JOIN t.interests i
           WHERE i IN :interests
           GROUP BY t
           HAVING COUNT(DISTINCT i) = :interestCount
           """)
    List<TouristProfile> findByAllInterests(@Param("interests") List<String> interests,
                                            @Param("interestCount") long interestCount);
}
