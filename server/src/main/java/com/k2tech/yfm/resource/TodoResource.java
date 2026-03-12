package com.k2tech.yfm.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.repository.TodoRepository;
import com.k2tech.yfm.repository.UserRepository;
import com.k2tech.yfm.model.User;
import com.k2tech.yfm.resource.dto.CreateTodoRequest;
import com.k2tech.yfm.resource.dto.UpdateTodoRequest;

import java.util.List;
import java.util.UUID;

@Path("/todos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("user")
public class TodoResource {

    @Inject
    TodoRepository todoRepository;

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
    public List<Todo> getAll() {
        return todoRepository.findByOwner(requireCurrentUser());
    }

    @GET
    @Path("/{id}")
    public Todo getById(@PathParam("id") UUID id) {
        return todoRepository.findByIdAndOwner(id, requireCurrentUser())
                .orElseThrow(NotFoundException::new);
    }

    @POST
    @Transactional
    public Response create(@Valid CreateTodoRequest request) {
        User currentUser = requireCurrentUser();
        Todo todo = new Todo();
        todo.title = request.title.trim();
        todo.completed = request.completed;
        todo.createdBy = currentUser;
        todo.completedBy = request.completed ? currentUser : null;
        todoRepository.persist(todo);
        return Response.status(Response.Status.CREATED).entity(todo).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Todo update(@PathParam("id") UUID id, @Valid UpdateTodoRequest request) {
        User currentUser = requireCurrentUser();
        Todo todo = todoRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(NotFoundException::new);

        if (request.title != null) {
            String trimmedTitle = request.title.trim();
            if (trimmedTitle.isEmpty()) {
                throw new BadRequestException("Title cannot be blank");
            }
            todo.title = trimmedTitle;
        }

        if (request.completed != null) {
            todo.completed = request.completed;
            if (request.completed) {
                todo.completedBy = currentUser;
            } else {
                todo.completedBy = null;
            }
        }

        return todo;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        boolean deleted = todoRepository.deleteByIdAndOwner(id, requireCurrentUser());
        if (!deleted) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }
}
