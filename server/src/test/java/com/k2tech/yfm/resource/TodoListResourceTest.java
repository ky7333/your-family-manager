package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.TodoListMember;
import com.k2tech.yfm.model.TodoListMemberId;
import com.k2tech.yfm.model.TodoListMembershipLevel;
import com.k2tech.yfm.model.User;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.MediaType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;

@QuarkusTest
class TodoListResourceTest {

    @BeforeEach
    @Transactional
    void setUp() {
        Todo.deleteAll();
        TodoList.deleteAll();
        User.deleteAll();
        Role.deleteAll();

        User.add("alice", "alice", Set.of("user"));
        User.add("bob", "bob", Set.of("user"));
        User.add("charlie", "charlie", Set.of("user"));
        User.add("diana", "diana", Set.of("user"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void listReturnsWriteAndReadOnlyAccessibleLists() {
        createListFor("alice", "Alice list", Set.of(), Set.of());
        createListFor("bob", "Shared write list", Set.of("alice"), Set.of());
        createListFor("charlie", "Shared read only list", Set.of(), Set.of("alice"));
        createListFor("bob", "Private list", Set.of(), Set.of());

        given()
                .when().get("/todo-lists")
                .then()
                .statusCode(200)
                .body("$", hasSize(3))
                .body("name", hasItem("Alice list"))
                .body("name", hasItem("Shared write list"))
                .body("name", hasItem("Shared read only list"))
                .body("name", not(hasItem("Private list")));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void createSupportsReadOnlySharingAndRemovesDuplicatesFromReadOnly() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "name", "Family Chores",
                        "sharedWithUsernames", new String[]{"bob", "charlie"},
                        "readOnlySharedWithUsernames", new String[]{"charlie", "diana", "alice"}
                ))
                .when().post("/todo-lists")
                .then()
                .statusCode(201)
                .body("name", equalTo("Family Chores"))
                .body("members.username", hasItem("alice"))
                .body("members.username", hasItem("bob"))
                .body("members.username", hasItem("charlie"))
                .body("readOnlyMembers.username", hasItem("diana"))
                .body("readOnlyMembers.username", not(hasItem("charlie")))
                .body("readOnlyMembers.username", not(hasItem("alice")));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void ownerCanUpdateReadOnlySharing() {
        UUID listId = createListFor("alice", "Family", Set.of("bob"), Set.of("charlie"));

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "sharedWithUsernames", new String[]{"bob", "diana"},
                        "readOnlySharedWithUsernames", new String[]{"charlie", "bob"}
                ))
                .when().put("/todo-lists/{id}", listId)
                .then()
                .statusCode(200)
                .body("members.username", hasItem("alice"))
                .body("members.username", hasItem("bob"))
                .body("members.username", hasItem("diana"))
                .body("readOnlyMembers.username", hasItem("charlie"))
                .body("readOnlyMembers.username", not(hasItem("bob")));
    }

    @Test
    @TestSecurity(user = "charlie", roles = {"user"})
    void readOnlyMemberCannotUpdateSharing() {
        UUID listId = createListFor("alice", "Alice list", Set.of("bob"), Set.of("charlie"));

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("readOnlySharedWithUsernames", new String[]{"diana"}))
                .when().put("/todo-lists/{id}", listId)
                .then()
                .statusCode(403);
    }

    @Transactional
    UUID createListFor(String ownerUsername, String name, Set<String> sharedWrite, Set<String> sharedReadOnly) {
        User owner = User.find("username", ownerUsername).firstResult();
        TodoList todoList = new TodoList();
        todoList.name = name;
        todoList.createdBy = owner;
        todoList.persist();

        addMembership(todoList, owner, TodoListMembershipLevel.OWNER);
        for (String username : sharedWrite) {
            User member = User.find("username", username).firstResult();
            if (member != null) {
                addMembership(todoList, member, TodoListMembershipLevel.READ_WRITE);
            }
        }
        for (String username : sharedReadOnly) {
            User member = User.find("username", username).firstResult();
            if (member != null && todoList.memberships.stream().noneMatch(existing -> existing.user.id.equals(member.id))) {
                addMembership(todoList, member, TodoListMembershipLevel.READ_ONLY);
            }
        }

        return todoList.id;
    }

    void addMembership(TodoList todoList, User user, TodoListMembershipLevel level) {
        if (todoList.memberships.stream().anyMatch(existing -> existing.user.id.equals(user.id))) {
            return;
        }
        TodoListMember membership = new TodoListMember();
        membership.todoList = todoList;
        membership.user = user;
        membership.membershipLevel = level;
        membership.id = new TodoListMemberId(todoList.id, user.id);
        todoList.memberships.add(membership);
    }
}
