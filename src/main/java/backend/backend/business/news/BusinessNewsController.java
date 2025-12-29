package backend.backend.business.news;

import backend.backend.core.user.user_entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business-news")
@RequiredArgsConstructor
public class BusinessNewsController {

    private final BusinessNewsService businessNewsService;

    // =========================
    // VIEW (ALL USERS)
    // =========================
    @GetMapping
    public ResponseEntity<List<BusinessNews>> getAll() {
        return ResponseEntity.ok(businessNewsService.getAllNews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessNews> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(businessNewsService.getById(id));
    }

    // =========================
    // CREATE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<BusinessNews> create(
            @Valid @RequestBody BusinessNews news,
            @RequestParam UUID industryId,
            @AuthenticationPrincipal User admin) {

        BusinessNews created = businessNewsService.createNews(news, industryId, admin);

        return ResponseEntity.created(URI.create("/api/business-news/" + created.getId()))
                .body(created);
    }

    // =========================
    // UPDATE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<BusinessNews> update(
            @PathVariable UUID id,
            @Valid @RequestBody BusinessNews details) {

        return ResponseEntity.ok(businessNewsService.updateNews(id, details));
    }

    // =========================
    // DELETE (ADMIN)
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessNewsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }
}
