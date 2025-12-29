package backend.backend.job.company;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // =========================
    // VIEW (ALL AUTH USERS)
    // =========================
    @GetMapping
    public ResponseEntity<List<Company>> getAll() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/industry/{industryId}")
    public ResponseEntity<List<Company>> getByIndustry(@PathVariable UUID industryId) {
        return ResponseEntity.ok(companyService.getCompaniesByIndustry(industryId));
    }

    // =========================
    // ADMIN ONLY
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Company> create(
            @RequestParam UUID industryId,
            @Valid @RequestBody Company company) {

        Company created = companyService.createCompany(company, industryId);
        return ResponseEntity
                .created(URI.create("/api/companies/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Company> update(
            @PathVariable UUID id,
            @Valid @RequestBody Company details) {

        return ResponseEntity.ok(companyService.updateCompany(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
