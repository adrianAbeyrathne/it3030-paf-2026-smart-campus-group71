package com.smartcampus.api.dto;

import com.smartcampus.api.model.enums.AuthProvider;
import com.smartcampus.api.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private String id;
    private String email;
    private String name;
    private String profilePicture;
    private UserRole role;
    private AuthProvider provider;
    private LocalDateTime createdAt;
}
