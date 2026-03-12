package com.k2tech.yfm.resource.dto;

import com.k2tech.yfm.model.TodoPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CreateTodoRequest {
    @NotNull
    public UUID listId;

    @NotBlank
    @Size(max = 255)
    public String title;

    @Size(max = 2000)
    public String details;

    @Pattern(regexp = "^$|\\d{4}-\\d{2}-\\d{2}$")
    public String dueDate;

    public TodoPriority priority;

    public boolean completed;
}
