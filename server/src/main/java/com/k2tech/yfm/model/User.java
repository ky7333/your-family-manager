package com.k2tech.yfm.model;

import jakarta.persistence.*;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.security.jpa.Password;
import io.quarkus.security.jpa.Roles;
import io.quarkus.security.jpa.UserDefinition;
import io.quarkus.security.jpa.Username;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.id.uuid.UuidVersion7Strategy;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "application_user")
@UserDefinition
public class User extends PanacheEntityBase {
    @Id
    @UuidGenerator(algorithm = UuidVersion7Strategy.class)
    public UUID id;
    @Username
    public String username;
    @Password
    @JsonIgnore
    public String password;
    @Roles
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    public List<Role> roles = new ArrayList<>();

    /**
     * Adds a new user to the database
     * @param username the username
     * @param password the unencrypted password (it is encrypted with bcrypt)
     * @param roles the set of roles
     */
    public static void add(String username, String password, Set<String> roles) {
        User user = new User();
        user.username = username;
        user.password = BcryptUtil.bcryptHash(password);
        for (String role : roles) {
            // Check if the role exists, if not create it
            Role existingRole = Role.find("role", role).firstResult();
            if (existingRole == null) {
                Role newRole = new Role();
                newRole.role = role;
                newRole.persist();
                user.roles.add(newRole);
            }
            else {
                user.roles.add(existingRole);
            }
        }
        user.persist();
    }
}