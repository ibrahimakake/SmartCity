package backend.backend.job.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    List<Company> findByIndustry_Id(UUID industryId);

    List<Company> findByNameContainingIgnoreCase(String name);
}
