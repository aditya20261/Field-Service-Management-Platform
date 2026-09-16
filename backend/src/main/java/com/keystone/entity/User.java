package com.keystone.entity;
import jakarta.persistence.*;
@Entity @Table(name="users")
public class User { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String email; @Column(nullable=false) private String password; @Column(nullable=false) private String fullName; @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role; @Column(nullable=false) private boolean active=true;
public Long getId(){return id;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;} public Role getRole(){return role;} public void setRole(Role v){role=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}}
