package backend.backend.job.industry;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/industries")
@RequiredArgsConstructor
public class IndustryController {

    private final IndustryService industryService;

    // ✅ VIEW — all authenticated users
    @GetMapping
    public ResponseEntity<List<Industry>> getAll() {
        return ResponseEntity.ok(industryService.getAllIndustries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Industry> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(industryService.getIndustryById(id));
    }

    // 🔒 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Industry> create(@Valid @RequestBody Industry industry) {
        Industry created = industryService.createIndustry(industry);
        return ResponseEntity
                .created(URI.create("/api/industries/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Industry> update(
            @PathVariable UUID id,
            @Valid @RequestBody Industry details) {
        return ResponseEntity.ok(industryService.updateIndustry(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        industryService.deleteIndustry(id);
        return ResponseEntity.noContent().build();
    }
}
