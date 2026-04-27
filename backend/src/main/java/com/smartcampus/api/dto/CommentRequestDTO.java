package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDTO {
    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}
