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
import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.TodoPriority;
import com.k2tech.yfm.repository.TodoListRepository;
import com.k2tech.yfm.repository.TodoRepository;
import com.k2tech.yfm.repository.UserRepository;
import com.k2tech.yfm.model.User;
import com.k2tech.yfm.resource.dto.CreateTodoRequest;
import com.k2tech.yfm.resource.dto.UpdateTodoRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
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
    TodoListRepository todoListRepository;

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

    private TodoList requireAccessibleList(UUID listId, User currentUser) {
        return todoListRepository.findByIdForUser(listId, currentUser)
                .orElseThrow(NotFoundException::new);
    }

    private LocalDate parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dueDate);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("dueDate must be in yyyy-MM-dd format");
        }
    }

    @GET
    public List<Todo> getAll(@QueryParam("listId") UUID listId) {
        User currentUser = requireCurrentUser();
        if (listId != null) {
            requireAccessibleList(listId, currentUser);
            return todoRepository.findByListAndUser(listId, currentUser);
        }
        return todoRepository.findByUser(currentUser);
    }

    @GET
    @Path("/{id}")
    public Todo getById(@PathParam("id") UUID id) {
        return todoRepository.findByIdForUser(id, requireCurrentUser())
                .orElseThrow(NotFoundException::new);
    }

    @POST
    @Transactional
    public Response create(@Valid CreateTodoRequest request) {
        User currentUser = requireCurrentUser();
        TodoList todoList = requireAccessibleList(request.listId, currentUser);
        LocalDateTime now = LocalDateTime.now();
        Todo todo = new Todo();
        todo.title = request.title.trim();
        todo.details = request.details == null || request.details.isBlank() ? null : request.details.trim();
        todo.dueDate = parseDueDate(request.dueDate);
        todo.priority = request.priority == null ? TodoPriority.MEDIUM : request.priority;
        todo.completed = request.completed;
        todo.createdAt = now;
        todo.updatedAt = now;
        todo.completedAt = request.completed ? now : null;
        todo.todoList = todoList;
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
        Todo todo = todoRepository.findByIdForUser(id, currentUser)
                .orElseThrow(NotFoundException::new);

        if (request.title != null) {
            String trimmedTitle = request.title.trim();
            if (trimmedTitle.isEmpty()) {
                throw new BadRequestException("Title cannot be blank");
            }
            todo.title = trimmedTitle;
        }

        if (request.details != null) {
            String trimmedDetails = request.details.trim();
            todo.details = trimmedDetails.isEmpty() ? null : trimmedDetails;
        }

        if (request.dueDate != null) {
            todo.dueDate = parseDueDate(request.dueDate);
        }

        if (request.priority != null) {
            todo.priority = request.priority;
        }

        if (request.completed != null) {
            todo.completed = request.completed;
            if (request.completed) {
                todo.completedBy = currentUser;
                todo.completedAt = LocalDateTime.now();
            } else {
                todo.completedBy = null;
                todo.completedAt = null;
            }
        }

        todo.updatedAt = LocalDateTime.now();
        return todo;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        User currentUser = requireCurrentUser();
        Todo todo = todoRepository.findByIdForUser(id, currentUser)
                .orElseThrow(NotFoundException::new);
        todoRepository.delete(todo);
        return Response.noContent().build();
    }
}
