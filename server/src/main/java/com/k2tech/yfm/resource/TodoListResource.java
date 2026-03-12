package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.User;
import com.k2tech.yfm.repository.TodoListRepository;
import com.k2tech.yfm.repository.UserRepository;
import com.k2tech.yfm.resource.dto.CreateTodoListRequest;
import com.k2tech.yfm.resource.dto.UpdateTodoListRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Path("/todo-lists")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("user")
public class TodoListResource {

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

    private List<User> resolveMembers(Set<String> sharedWithUsernames, User owner) {
        LinkedHashSet<String> usernames = new LinkedHashSet<>();
        usernames.add(owner.username);

        if (sharedWithUsernames != null) {
            for (String username : sharedWithUsernames) {
                if (username == null) {
                    continue;
                }
                String normalized = username.trim();
                if (!normalized.isEmpty()) {
                    usernames.add(normalized);
                }
            }
        }

        List<User> members = new ArrayList<>();
        for (String username : usernames) {
            User member = userRepository.findByUsername(username);
            if (member == null) {
                throw new BadRequestException("Unknown username: " + username);
            }
            members.add(member);
        }
        return members;
    }

    @GET
    public List<TodoList> getAll() {
        return todoListRepository.findAccessibleByUser(requireCurrentUser());
    }

    @POST
    @Transactional
    public Response create(@Valid CreateTodoListRequest request) {
        User currentUser = requireCurrentUser();
        String trimmedName = request.name.trim();
        if (trimmedName.isEmpty()) {
            throw new BadRequestException("List name cannot be blank");
        }

        TodoList todoList = new TodoList();
        todoList.name = trimmedName;
        todoList.createdBy = currentUser;
        todoList.members = resolveMembers(request.sharedWithUsernames, currentUser);

        todoListRepository.persist(todoList);
        return Response.status(Response.Status.CREATED).entity(todoList).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public TodoList update(@PathParam("id") UUID id, @Valid UpdateTodoListRequest request) {
        User currentUser = requireCurrentUser();
        TodoList todoList = todoListRepository.findByIdForUser(id, currentUser)
                .orElseThrow(NotFoundException::new);

        if (!todoList.createdBy.id.equals(currentUser.id)) {
            throw new ForbiddenException("Only the list owner can update sharing");
        }

        if (request.name != null) {
            String trimmedName = request.name.trim();
            if (trimmedName.isEmpty()) {
                throw new BadRequestException("List name cannot be blank");
            }
            todoList.name = trimmedName;
        }

        if (request.sharedWithUsernames != null) {
            List<User> members = resolveMembers(request.sharedWithUsernames, todoList.createdBy);
            todoList.members.clear();
            todoList.members.addAll(members);
        }

        return todoList;
    }
}
