package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.TodoList;
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
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void listOnlyReturnsAccessibleLists() {
        createListFor("alice", "Alice list");
        createListFor("bob", "Shared list", "alice");
        createListFor("bob", "Private list");

        given()
                .when().get("/todo-lists")
                .then()
                .statusCode(200)
                .body("$", hasSize(2))
                .body("name", hasItem("Alice list"))
                .body("name", hasItem("Shared list"))
                .body("name", not(hasItem("Private list")));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void createSupportsSharingByUsername() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "name", "Family Chores",
                        "sharedWithUsernames", new String[]{"bob"}
                ))
                .when().post("/todo-lists")
                .then()
                .statusCode(201)
                .body("name", equalTo("Family Chores"))
                .body("members.username", hasItem("alice"))
                .body("members.username", hasItem("bob"));
    }

    @Test
    @TestSecurity(user = "bob", roles = {"user"})
    void nonOwnerCannotUpdateSharing() {
        UUID listId = createListFor("alice", "Alice private", "bob");

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("sharedWithUsernames", new String[]{"charlie"}))
                .when().put("/todo-lists/{id}", listId)
                .then()
                .statusCode(403);
    }

    @Transactional
    UUID createListFor(String ownerUsername, String name, String... sharedWith) {
        User owner = User.find("username", ownerUsername).firstResult();
        TodoList todoList = new TodoList();
        todoList.name = name;
        todoList.createdBy = owner;
        todoList.members.add(owner);

        for (String username : sharedWith) {
            User member = User.find("username", username).firstResult();
            if (member != null && todoList.members.stream().noneMatch(existing -> existing.id.equals(member.id))) {
                todoList.members.add(member);
            }
        }

        todoList.persist();
        return todoList.id;
    }
}
