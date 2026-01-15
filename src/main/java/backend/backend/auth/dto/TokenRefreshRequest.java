package backend.backend.auth.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}