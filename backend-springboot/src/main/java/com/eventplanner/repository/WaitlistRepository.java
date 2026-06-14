package com.eventplanner.repository;

import com.eventplanner.model.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    List<Waitlist> findByEventIdOrderByPositionAsc(Long eventId);

    Optional<Waitlist> findByUserIdAndEventId(Long userId, Long eventId);

    int countByEventId(Long eventId);
}
