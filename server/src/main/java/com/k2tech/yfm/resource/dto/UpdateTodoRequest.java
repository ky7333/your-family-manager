package com.k2tech.yfm.resource.dto;

import jakarta.validation.constraints.Size;

public class UpdateTodoRequest {
    @Size(min = 1, max = 255)
    public String title;

    public Boolean completed;
}
