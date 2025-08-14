package com.k2tech.yfm.model;

import jakarta.persistence.*;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.security.jpa.Password;
import io.quarkus.security.jpa.Roles;
import io.quarkus.security.jpa.UserDefinition;
import io.quarkus.security.jpa.Username;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "application_user")
@UserDefinition
public class User extends PanacheEntity {
    @Username
    public String username;
    @Password
    @JsonIgnore
    public String password;
    @Roles
    @ManyToMany(fetch = FetchType.EAGER)
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