package com.smartcampus.api.model;

import com.smartcampus.api.model.enums.AuthProvider;
import com.smartcampus.api.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User extends BaseDocument {

    @Id
    private String id;
    private String email;
    private String name;
    private String profilePicture;
    private UserRole role;
    private AuthProvider provider;
    private String password;
}
