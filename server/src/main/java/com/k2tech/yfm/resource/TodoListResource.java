package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.TodoListMember;
import com.k2tech.yfm.model.TodoListMemberId;
import com.k2tech.yfm.model.TodoListMembershipLevel;
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

    private LinkedHashSet<String> normalizeUsernames(Set<String> usernames) {
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        if (usernames == null) {
            return normalized;
        }

        for (String username : usernames) {
            if (username == null) {
                continue;
            }
            String value = username.trim();
            if (!value.isEmpty()) {
                normalized.add(value);
            }
        }

        return normalized;
    }

    private User requireUserByUsername(String username) {
        User member = userRepository.findByUsername(username);
        if (member == null) {
            throw new BadRequestException("Unknown username: " + username);
        }
        return member;
    }

    private TodoListMember createMembership(TodoList todoList, User user, TodoListMembershipLevel level) {
        TodoListMember membership = new TodoListMember();
        membership.todoList = todoList;
        membership.user = user;
        membership.membershipLevel = level;
        membership.id = new TodoListMemberId(todoList.id, user.id);
        return membership;
    }

    private void applyMemberships(
            TodoList todoList,
            User owner,
            Set<String> writeUsernames,
            Set<String> readOnlyUsernames
    ) {
        LinkedHashSet<String> writeSet = normalizeUsernames(writeUsernames);
        writeSet.add(owner.username);
        LinkedHashSet<String> readOnlySet = normalizeUsernames(readOnlyUsernames);
        LinkedHashSet<String> allUsernames = new LinkedHashSet<>();
        allUsernames.addAll(writeSet);
        allUsernames.addAll(readOnlySet);

        java.util.Map<String, User> usersByUsername = new java.util.HashMap<>();
        for (String username : allUsernames) {
            usersByUsername.put(username, requireUserByUsername(username));
        }

        java.util.Map<UUID, TodoListMembershipLevel> desiredLevelsByUserId = new java.util.HashMap<>();
        for (String username : writeSet) {
            User user = usersByUsername.get(username);
            TodoListMembershipLevel level = user.id.equals(owner.id)
                    ? TodoListMembershipLevel.OWNER
                    : TodoListMembershipLevel.READ_WRITE;
            desiredLevelsByUserId.put(user.id, level);
            readOnlySet.remove(username);
        }
        for (String username : readOnlySet) {
            User user = usersByUsername.get(username);
            desiredLevelsByUserId.put(user.id, TodoListMembershipLevel.READ_ONLY);
        }

        java.util.Map<UUID, TodoListMember> existingByUserId = new java.util.HashMap<>();
        java.util.Iterator<TodoListMember> iterator = todoList.memberships.iterator();
        while (iterator.hasNext()) {
            TodoListMember membership = iterator.next();
            if (!desiredLevelsByUserId.containsKey(membership.user.id)) {
                iterator.remove();
                continue;
            }
            existingByUserId.put(membership.user.id, membership);
        }

        for (String username : allUsernames) {
            User user = usersByUsername.get(username);
            TodoListMembershipLevel desiredLevel = desiredLevelsByUserId.get(user.id);
            TodoListMember existing = existingByUserId.get(user.id);
            if (existing != null) {
                existing.membershipLevel = desiredLevel;
            } else {
                todoList.memberships.add(createMembership(todoList, user, desiredLevel));
            }
        }
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

        todoListRepository.persist(todoList);
        applyMemberships(todoList, currentUser, request.sharedWithUsernames, request.readOnlySharedWithUsernames);

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

        if (request.sharedWithUsernames != null || request.readOnlySharedWithUsernames != null) {
            Set<String> writeUsernames = request.sharedWithUsernames != null
                    ? request.sharedWithUsernames
                    : todoList.getMembers().stream().map(member -> member.username).collect(java.util.stream.Collectors.toSet());

            Set<String> readOnlyUsernames = request.readOnlySharedWithUsernames != null
                    ? request.readOnlySharedWithUsernames
                    : todoList.getReadOnlyMembers().stream().map(member -> member.username).collect(java.util.stream.Collectors.toSet());

            applyMemberships(todoList, todoList.createdBy, writeUsernames, readOnlyUsernames);
        }

        return todoList;
    }
}
