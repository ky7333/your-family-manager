package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.User;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class UserResourceTest {

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
    void meRequiresAuthentication() {
        given()
                .when().get("/me")
                .then()
                .statusCode(401);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void meReturnsCurrentUser() {
        given()
                .when().get("/me")
                .then()
                .statusCode(200)
                .body("username", equalTo("alice"))
                .body("password", nullValue());
    }

    @Test
    void searchUsersRequiresAuthentication() {
        given()
                .queryParam("q", "a")
                .when().get("/users/search")
                .then()
                .statusCode(401);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void searchUsersReturnsMatchingUsernamesAndExcludesCurrentUser() {
        given()
                .queryParam("q", "b")
                .when().get("/users/search")
                .then()
                .statusCode(200)
                .body("username", hasItem("bob"))
                .body("username", not(hasItem("alice")));
    }
}
