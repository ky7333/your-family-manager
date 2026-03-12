package com.k2tech.yfm.resource.dto;

import com.k2tech.yfm.model.User;

import java.util.UUID;

public record UserSearchResult(UUID id, String username) {
    public static UserSearchResult from(User user) {
        return new UserSearchResult(user.id, user.username);
    }
}
