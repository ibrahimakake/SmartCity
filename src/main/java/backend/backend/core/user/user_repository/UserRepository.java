package backend.backend.core.user.user_repository;

import backend.backend.core.user.user_entity.User;
import backend.backend.enums.Role;  // Make sure to import your Role enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Existing methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);








    // New role-based methods
    List<User> findByRole(Role role);
    boolean existsByIdAndRole(UUID id, Role role);
    long countByRole(Role role);
    void deleteByRole(Role role);

    // Advanced query methods
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = :active")
    List<User> findActiveUsersByRole(@Param("role") Role role, @Param("active") boolean active);

    @Modifying
    @Query("UPDATE User u SET u.role = :newRole WHERE u.role = :oldRole")
    int updateRoleForAllUsersWithRole(
            @Param("oldRole") Role oldRole,
            @Param("newRole") Role newRole
    );

    @Modifying
    @Query("DELETE FROM User u WHERE u.role = :role AND u.lastLogin < :date")
    int deleteInactiveUsersByRole(
            @Param("role") Role role,
            @Param("date") java.time.LocalDate date
    );
}