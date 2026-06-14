package com.eventplanner.dto;

import java.time.LocalDateTime;

public class UserInfoResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean isVerified;
    private String bio;
    private String phone;
    private LocalDateTime createdAt;

    public UserInfoResponse(Long id, String name, String email, String role,
                            Boolean isVerified, String bio, String phone, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isVerified = isVerified;
        this.bio = bio;
        this.phone = phone;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
