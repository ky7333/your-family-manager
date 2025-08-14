package com.k2tech.yfm.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.repository.TodoRepository;
import com.k2tech.yfm.repository.UserRepository;
import com.k2tech.yfm.model.User;

import java.util.List;

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

    @GET
    public List<Todo> getAll() {
        return todoRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Todo getById(@PathParam("id") Long id) {
        return todoRepository.findById(id);
    }

    @POST
    @Transactional
    public Response create(Todo todo) {
        String username = securityContext.getUserPrincipal().getName();
        todo.createdBy = userRepository.findByUsername(username);
        todoRepository.persist(todo);
        return Response.status(Response.Status.CREATED).entity(todo).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Todo update(@PathParam("id") Long id, Todo updatedTodo) {
        Todo todo = todoRepository.findById(id);
        if (todo == null) {
            throw new NotFoundException();
        }
        todo.title = updatedTodo.title;
        todo.completed = updatedTodo.completed;
        if (updatedTodo.completed) {
            String username = securityContext.getUserPrincipal().getName();
            todo.completedBy = userRepository.findByUsername(username);
        }
        return todo;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = todoRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }
}
