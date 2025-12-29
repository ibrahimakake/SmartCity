package backend.backend.student.library;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/libraries")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    // =========================
    // VIEW (all authenticated users)
    // =========================
    @GetMapping
    public ResponseEntity<List<Library>> getAll() {
        return ResponseEntity.ok(libraryService.getAllLibraries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Library> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(libraryService.getLibraryById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Library>> search(@RequestParam String query) {
        return ResponseEntity.ok(libraryService.searchLibraries(query));
    }

    // =========================
    // ADMIN ONLY
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Library> create(@Valid @RequestBody Library library) {
        Library created = libraryService.createLibrary(library);
        return ResponseEntity
                .created(URI.create("/api/libraries/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Library> update(
            @PathVariable UUID id,
            @Valid @RequestBody Library details) {
        return ResponseEntity.ok(libraryService.updateLibrary(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        libraryService.deleteLibrary(id);
        return ResponseEntity.noContent().build();
    }
}
