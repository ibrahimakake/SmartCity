package backend.backend.core.user.user_service;

import backend.backend.core.user.user_dto.TouristProfileRequestDTO;
import backend.backend.core.user.user_dto.TouristProfileResponseDTO;
import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.core.user.user_entity.User;
import backend.backend.core.user.user_repository.TouristProfileRepository;
import backend.backend.core.user.user_repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TouristProfileService {

    private final TouristProfileRepository touristProfileRepository;
    private final UserRepository userRepository;

    // ADMIN only (controller will enforce)
    @Transactional(readOnly = true)
    public List<TouristProfileResponseDTO> getAllTouristProfiles() {
        return touristProfileRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ADMIN only (controller will enforce)
    @Transactional(readOnly = true)
    public TouristProfileResponseDTO getTouristProfileById(UUID id) {
        TouristProfile profile = touristProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found"));
        return mapToResponse(profile);
    }

    // TOURIST: update his own profile (recommended endpoint)
    @Transactional
    public TouristProfileResponseDTO updateMyTouristProfile(Authentication auth, TouristProfileRequestDTO dto) {

        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TouristProfile profile = touristProfileRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found for this user"));

        profile.setNationality(dto.getNationality());
        profile.setPreferences(dto.getPreferences());
        profile.setInterests(dto.getInterests());

        TouristProfile saved = touristProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    // ADMIN: update any profile by id (optional)
    @Transactional
    public TouristProfileResponseDTO updateTouristProfile(UUID id, TouristProfileRequestDTO dto) {

        TouristProfile profile = touristProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found"));

        profile.setNationality(dto.getNationality());
        profile.setPreferences(dto.getPreferences());
        profile.setInterests(dto.getInterests());

        TouristProfile saved = touristProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    // =========================
    // Mapping helper (private)
    // =========================
    private TouristProfileResponseDTO mapToResponse(TouristProfile profile) {
        TouristProfileResponseDTO dto = new TouristProfileResponseDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setNationality(profile.getNationality());
        dto.setPreferences(profile.getPreferences());
        dto.setInterests(profile.getInterests());
        return dto;
    }
}
