package com.smartcampus.api.repository;

import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}
