package com.smartcampus.api.repository;

import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByLocation(String location);

    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    long countByStatus(ResourceStatus status);

    long countByType(ResourceType type);
}
