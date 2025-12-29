package backend.backend.core.user.user_controller;

import backend.backend.core.user.user_dto.TouristProfileRequestDTO;
import backend.backend.core.user.user_dto.TouristProfileResponseDTO;
import backend.backend.core.user.user_service.TouristProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tourist-profiles")
@RequiredArgsConstructor
public class TouristProfileController {

    private final TouristProfileService touristProfileService;

    // ✅ ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<TouristProfileResponseDTO>> getAllTouristProfiles() {
        return ResponseEntity.ok(touristProfileService.getAllTouristProfiles());
    }

    // ✅ ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<TouristProfileResponseDTO> getTouristProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(touristProfileService.getTouristProfileById(id));
    }

    // ✅ TOURIST ONLY (update own profile)
    @PreAuthorize("hasRole('TOURIST')")
    @PutMapping("/me")
    public ResponseEntity<TouristProfileResponseDTO> updateMyTouristProfile(
            Authentication authentication,
            @Valid @RequestBody TouristProfileRequestDTO dto) {

        return ResponseEntity.ok(touristProfileService.updateMyTouristProfile(authentication, dto));
    }

    // ✅ ADMIN ONLY (optional: update any profile)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<TouristProfileResponseDTO> updateTouristProfile(
            @PathVariable UUID id,
            @Valid @RequestBody TouristProfileRequestDTO dto) {

        return ResponseEntity.ok(touristProfileService.updateTouristProfile(id, dto));
    }
}
