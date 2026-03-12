package com.k2tech.yfm.resource.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTodoRequest {
    @NotBlank
    @Size(max = 255)
    public String title;

    public boolean completed;
}
