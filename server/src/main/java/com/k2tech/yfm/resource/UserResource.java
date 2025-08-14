package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.User;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.inject.Inject;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;

@Path("/me")
@Authenticated
public class UserResource {
    @Inject
    SecurityIdentity identity;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMe() {
        if (identity == null || identity.isAnonymous()) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        String username = identity.getPrincipal().getName();
        User user = User.find("username", username).firstResult();
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(user).build();
    }
}
