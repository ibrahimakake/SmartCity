package backend.backend.tourism.atm;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/atms")
@RequiredArgsConstructor
public class ATMController {

    private final ATMService atmService;

    //  VIEW: tourists can view
    @GetMapping
    public ResponseEntity<List<ATM>> getAllATMs() {
        return ResponseEntity.ok(atmService.getAllATMs());
    }

    //  VIEW: tourists can view
    @GetMapping("/{id}")
    public ResponseEntity<ATM> getATMById(@PathVariable UUID id) {
        return ResponseEntity.ok(atmService.getATMById(id));
    }

    //  VIEW: tourists can view
    @GetMapping("/search")
    public ResponseEntity<List<ATM>> searchATMs(@RequestParam String query) {
        return ResponseEntity.ok(atmService.searchATMs(query));
    }

    //  ADMIN ONLY: create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ATM> createATM(@Valid @RequestBody ATM atm) {
        ATM createdATM = atmService.createATM(atm);
        return ResponseEntity.created(URI.create("/api/atms/" + createdATM.getId()))
                .body(createdATM);
    }

    //  ADMIN ONLY: update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ATM> updateATM(
            @PathVariable UUID id,
            @Valid @RequestBody ATM atmDetails) {
        return ResponseEntity.ok(atmService.updateATM(id, atmDetails));
    }

    //  ADMIN ONLY: delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteATM(@PathVariable UUID id) {
        atmService.deleteATM(id);
        return ResponseEntity.noContent().build();
    }
}