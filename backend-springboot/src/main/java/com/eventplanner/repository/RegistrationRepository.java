package com.eventplanner.repository;

import com.eventplanner.model.Registration;
import com.eventplanner.model.Registration.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);

    List<Registration> findByUserId(Long userId);

    List<Registration> findByEventId(Long eventId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    @Query("SELECT r FROM Registration r WHERE r.user.id = :userId AND r.status <> 'CANCELLED' " +
           "AND r.event.startTime < :endTime AND r.event.endTime > :startTime")
    List<Registration> findConflictingRegistrations(@Param("userId") Long userId,
                                                     @Param("startTime") java.time.LocalDateTime startTime,
                                                     @Param("endTime") java.time.LocalDateTime endTime);

    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, RegistrationStatus status);
}
