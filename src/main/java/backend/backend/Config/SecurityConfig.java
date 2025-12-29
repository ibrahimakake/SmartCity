package backend.backend.Config;

import backend.backend.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService; // Votre CustomUserDetailsService
    private final PasswordEncoder passwordEncoder;       // Votre PasswordEncoderConfig

    // ========================================
    // Security Filter Chain
    // ========================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        //  Public endpoints
                        .requestMatchers("/auth/**").permitAll()

                        //  Booking endpoints: only TOURIST
                        .requestMatchers("/api/hotel-bookings/**").hasRole("TOURIST")
                        .requestMatchers("/api/restaurant-reservations/**").hasRole("TOURIST")
                        .requestMatchers("/api/theatre-bookings/**").hasRole("TOURIST")

                        //  All other API endpoints: any authenticated user can view/search
                        // Admin write operations will be protected by @PreAuthorize on controller methods
                        .requestMatchers("/api/**").authenticated()

                        .anyRequest().authenticated()
                )


                //  AJOUTÉ : AuthenticationProvider
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ========================================
    // Authentication Provider -  LA MÉTHODE MANQUANTE
    // ========================================
    /**
     * Configure comment Spring vérifie les credentials lors du login
     * - Utilise CustomUserDetailsService pour charger l'utilisateur depuis la DB
     * - Utilise BCryptPasswordEncoder pour comparer les mots de passe
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    // ========================================
    // Authentication Manager
    // ========================================
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}