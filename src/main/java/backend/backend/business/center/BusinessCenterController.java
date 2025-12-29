package backend.backend.business.center;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business-centers")
@RequiredArgsConstructor
public class BusinessCenterController {

    private final BusinessCenterService businessCenterService;

    // ✅ VIEW
    @GetMapping
    public ResponseEntity<List<BusinessCenter>> getAll() {
        return ResponseEntity.ok(businessCenterService.getAllCenters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessCenter> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(businessCenterService.getCenterById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BusinessCenter>> search(@RequestParam String query) {
        return ResponseEntity.ok(businessCenterService.searchCenters(query));
    }

    // 🔒 ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<BusinessCenter> create(@Valid @RequestBody BusinessCenter center) {
        BusinessCenter created = businessCenterService.createCenter(center);
        return ResponseEntity.created(URI.create("/api/business-centers/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<BusinessCenter> update(
            @PathVariable UUID id,
            @Valid @RequestBody BusinessCenter details) {
        return ResponseEntity.ok(businessCenterService.updateCenter(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessCenterService.deleteCenter(id);
        return ResponseEntity.noContent().build();
    }
}
