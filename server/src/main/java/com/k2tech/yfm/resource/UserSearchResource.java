package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.User;
import com.k2tech.yfm.repository.UserRepository;
import com.k2tech.yfm.resource.dto.UserSearchResult;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("user")
public class UserSearchResource {

    @Inject
    UserRepository userRepository;

    @Context
    SecurityContext securityContext;

    private User requireCurrentUser() {
        String username = securityContext.getUserPrincipal().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotAuthorizedException("Authenticated user not found");
        }
        return user;
    }

    @GET
    @Path("/search")
    public List<UserSearchResult> searchByUsername(
            @QueryParam("q") String query,
            @QueryParam("limit") @DefaultValue("8") int limit
    ) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isEmpty()) {
            return List.of();
        }

        int safeLimit = Math.min(Math.max(limit, 1), 20);
        String currentUsername = requireCurrentUser().username;
        return userRepository.searchByUsername(normalizedQuery, currentUsername, safeLimit)
                .stream()
                .map(UserSearchResult::from)
                .toList();
    }
}
