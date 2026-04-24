package com.smartcampus.api.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceStatsDTO {

    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
    private Map<String, Long> resourcesByType;
}
