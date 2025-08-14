package com.k2tech.yfm.resource;

import io.quarkus.security.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.vertx.http.runtime.security.FormAuthenticationMechanism;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.POST;

@Path("/logout")
class LogoutResource {
    @Inject
    SecurityIdentity identity;

    @POST
    public Response logout() {
        if (identity.isAnonymous()) {
            throw new UnauthorizedException("Not authenticated");
        }
        FormAuthenticationMechanism.logout(identity);
        return Response.noContent().build();
    }
}

