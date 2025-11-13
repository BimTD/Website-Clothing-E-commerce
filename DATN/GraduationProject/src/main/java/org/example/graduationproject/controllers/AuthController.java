package org.example.graduationproject.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.graduationproject.dto.LoginRequestDTO;
import org.example.graduationproject.dto.LoginResponseDTO;
import org.example.graduationproject.dto.RegisterRequestDTO;
import org.example.graduationproject.security.jwt.TokenProvider;
import org.example.graduationproject.services.UserRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final UserRegistrationService userRegistrationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            String username = loginRequest.getUsername();
            String password = loginRequest.getPassword();

            // Verify username and password
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!passwordEncoder.matches(password, userDetails.getPassword())) {
                return ResponseEntity.status(401).body(new ErrorResponse("Invalid username or password"));
            }
            if (!userDetails.isEnabled()) {
                return ResponseEntity.status(401).body(new ErrorResponse("User is disabled"));
            }

            // Extract roles and generate token with roles claim
            String roles = userDetails.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
            String token = tokenProvider.generateToken(Map.of(
                    "username", username,
                    "roles", roles
            ));

            return ResponseEntity.ok(new LoginResponseDTO(token, username, roles));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        try {
            // Validate passwords match
            if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Confirmation password does not match!"));
            }

            // Register user
            UserRegistrationService.RegistrationResult result = userRegistrationService.registerUser(
                    registerRequest.getUsername(), 
                    registerRequest.getEmail(), 
                    registerRequest.getPassword()
            );

            if (result.isSuccess()) {
                return ResponseEntity.ok(new SuccessResponse(result.getMessage()));
            } else {
                return ResponseEntity.badRequest().body(new ErrorResponse(result.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("An error occurred while registering: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Not authenticated"));
        }
        
        String username = authentication.getName();
        String roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
                
        return ResponseEntity.ok(new UserInfoDTO(username, roles));
    }


    public static class UserInfoDTO {
        private String username;
        private String roles;
        
        public UserInfoDTO(String username, String roles) {
            this.username = username;
            this.roles = roles;
        }
        
        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRoles() { return roles; }
        public void setRoles(String roles) { this.roles = roles; }
    }

    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        // getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        // getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
