package com.eventplanner.service;

import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.User;
import com.eventplanner.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUnverifiedUsers() {
        return userRepository.findByIsVerifiedFalse();
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }
        user.setIsVerified(true);
        return userRepository.save(user);
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email, 0L));
    }

    public User updateUser(Long id, User updates) {
        User user = getUser(id);
        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getBio() != null) user.setBio(updates.getBio());
        if (updates.getPhone() != null) user.setPhone(updates.getPhone());
        if (updates.getRole() != null) user.setRole(updates.getRole());
        return userRepository.save(user);
    }

    public User verifyUser(Long id) {
        User user = getUser(id);
        user.setIsVerified(true);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.deleteById(id);
    }
}
