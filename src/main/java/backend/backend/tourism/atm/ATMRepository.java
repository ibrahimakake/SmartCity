package backend.backend.tourism.atm;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ATMRepository extends JpaRepository<ATM, UUID> {
    List<ATM> findByNameContainingIgnoreCaseOrBankNameContainingIgnoreCaseOrAddressContainingIgnoreCase(
            String nameQuery, String bankNameQuery, String addressQuery
    );
}