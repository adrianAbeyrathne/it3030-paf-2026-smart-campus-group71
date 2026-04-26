package com.smartcampus.api.controller;

import com.smartcampus.api.config.JwtUtil;
import com.smartcampus.api.dto.*;
import com.smartcampus.api.model.User;
import com.smartcampus.api.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/test")
    public String test() {
        return "Auth Controller is Active!";
    }

    /**
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        logger.info("Received signup request for email: {}", request.getEmail());
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            String jwt = jwtUtil.generateToken(user);
            
            AuthResponse response = buildAuthResponse(user, jwt);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "User registered successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Received login request for email: {}", request.getEmail());
        try {
            User user = userService.verifyLocalLogin(request.getEmail(), request.getPassword());
            String jwt = jwtUtil.generateToken(user);
            
            AuthResponse response = buildAuthResponse(user, jwt);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * POST /api/auth/google
     * Frontend sends the Google ID token; backend verifies it with Google,
     * finds or creates the user, and returns a JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateWithGoogle(
            @RequestBody GoogleAuthRequest request) {

        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "ID token is required", null));
        }

        try {
            // Verify the Google ID token using Google's public endpoint
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token="
                    + request.getIdToken();

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restTemplate.getForObject(tokenInfoUrl, Map.class);

            if (tokenInfo == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Could not verify Google token", null));
            }

            // Check email is verified
            if (!"true".equals(String.valueOf(tokenInfo.get("email_verified")))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Google email not verified", null));
            }

            // Verify the token was issued for our app (skip check if placeholder)
            String aud = (String) tokenInfo.get("aud");
            if (aud != null && !googleClientId.equals("YOUR_GOOGLE_CLIENT_ID_HERE")
                    && !googleClientId.equals(aud)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Token audience mismatch", null));
            }

            String email   = (String) tokenInfo.get("email");
            String name    = (String) tokenInfo.getOrDefault("name", email);
            String picture = (String) tokenInfo.get("picture");

            // Find existing user or create a new one
            User user = userService.findOrCreateByGoogle(email, name, picture);

            // Generate JWT
            String jwt = jwtUtil.generateToken(user);

            AuthResponse authResponse = AuthResponse.builder()
                    .token(jwt)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .profilePicture(user.getProfilePicture())
                    .build();

            logger.info("User authenticated via Google: {} (role={})", email, user.getRole());
            return ResponseEntity.ok(new ApiResponse<>(true, "Authentication successful", authResponse));

        } catch (Exception e) {
            logger.error("Google authentication failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Authentication failed: " + e.getMessage(), null));
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    /** GET /api/auth/me – returns current user info based on JWT */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserService.UserInfo>> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Not authenticated", null));
        }
        String userId = (String) authentication.getPrincipal();
        UserService.UserInfo info = userService.getUserInfo(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User info", info));
    }
}
