package com.smartcampus.api.service;

import com.smartcampus.api.dto.UserResponseDTO;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.AuthProvider;
import com.smartcampus.api.model.enums.UserRole;
import com.smartcampus.api.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ──────────────────────────────────────────────────────────────
    // Authentication – Local and Google
    // ──────────────────────────────────────────────────────────────
    
    /** Local Registration */
    public User registerUser(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        User newUser = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(UserRole.USER)
                .provider(AuthProvider.LOCAL)
                .build();
        return userRepository.save(newUser);
    }

    /** Local Login Verification */
    public User verifyLocalLogin(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("This account uses " + user.getProvider() + " login");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }

    public User findOrCreateByGoogle(String email, String name, String picture) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .role(UserRole.USER)          // default role
                    .provider(AuthProvider.GOOGLE)
                    .build();
            return userRepository.save(newUser);
        });
    }

    // ──────────────────────────────────────────────────────────────
    // User management (admin operations)
    // ──────────────────────────────────────────────────────────────
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToResponse(user);
    }

    public UserResponseDTO updateUserRole(String id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(role);
        return mapToResponse(userRepository.save(user));
    }

    // ──────────────────────────────────────────────────────────────
    // Helper: lightweight info record for /auth/me
    // ──────────────────────────────────────────────────────────────
    public UserInfo getUserInfo(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return new UserInfo(user.getId(), user.getEmail(), user.getName(),
                user.getRole().name(), user.getProfilePicture());
    }

    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private String name;
        private String role;
        private String profilePicture;
    }

    // ──────────────────────────────────────────────────────────────
    // Mapping
    // ──────────────────────────────────────────────────────────────
    private UserResponseDTO mapToResponse(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
