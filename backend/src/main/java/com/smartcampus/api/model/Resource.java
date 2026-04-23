package com.smartcampus.api.model;

import com.smartcampus.api.model.enums.ResourceStatus;
import com.smartcampus.api.model.enums.ResourceType;
import java.util.List;
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
@Document(collection = "resources")
public class Resource extends BaseDocument {

    @Id
    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private ResourceStatus status;
    private List<String> availabilityWindows;
    private String description;
}
