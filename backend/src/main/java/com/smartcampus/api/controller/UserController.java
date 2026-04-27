package com.smartcampus.api.controller;

import com.smartcampus.api.dto.ApiResponse;
import com.smartcampus.api.dto.UserResponseDTO;
import com.smartcampus.api.dto.UserRoleUpdateDTO;
import com.smartcampus.api.model.enums.UserRole;
import com.smartcampus.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** GET /api/users – list all users (ADMIN only) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers(Authentication auth) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Admin access required", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched", userService.getAllUsers()));
    }

    /** GET /api/users/{id} – get single user (ADMIN only) */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(
            @PathVariable String id, Authentication auth) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Admin access required", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched", userService.getUserById(id)));
    }

    /** PUT /api/users/{id}/role – change a user's role (ADMIN only) */
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateRole(
            @PathVariable String id,
            @Valid @RequestBody UserRoleUpdateDTO dto,
            Authentication auth) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Admin access required", null));
        }
        UserResponseDTO updated = userService.updateUserRole(id, dto.getRole());
        return ResponseEntity.ok(new ApiResponse<>(true, "Role updated to " + dto.getRole(), updated));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsersByRole(
            @PathVariable UserRole role, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched", userService.getUsersByRole(role)));
    }

    /** GET /api/users/me – returns the currently logged-in user's profile */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getCurrentUser(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Not authenticated", null));
        }
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile fetched", userService.getUserById(userId)));
    }

    // ── helper ──────────────────────────────────────────────────────
    private boolean isAdmin(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
