package com.k2tech.yfm.resource.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateTodoListRequest {
    @Size(min = 1, max = 255)
    public String name;

    public Set<@NotBlank @Size(max = 255) String> sharedWithUsernames;

    public Set<@NotBlank @Size(max = 255) String> readOnlySharedWithUsernames;
}
