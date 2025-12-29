package backend.backend.business.business;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    // =========================
    // VIEW (ALL USERS)
    // =========================
    @GetMapping
    public ResponseEntity<List<Business>> getAll() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Business> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }

    // =========================
    // CREATE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Business> create(@Valid @RequestBody Business business) {
        Business created = businessService.createBusiness(business);
        return ResponseEntity.created(URI.create("/api/businesses/" + created.getId()))
                .body(created);
    }

    // =========================
    // UPDATE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Business> update(
            @PathVariable UUID id,
            @Valid @RequestBody Business details) {
        return ResponseEntity.ok(businessService.updateBusiness(id, details));
    }

    // =========================
    // DELETE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessService.deleteBusiness(id);
        return ResponseEntity.noContent().build();
    }
}
