package com.eventplanner.repository;

import com.eventplanner.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByCategoryId(Long categoryId);

    List<Event> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' AND e.startTime >= :now ORDER BY e.startTime ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId AND e.status <> 'CANCELLED' " +
           "AND e.startTime < :endTime AND e.endTime > :startTime " +
           "AND (:excludeEventId IS NULL OR e.id <> :excludeEventId)")
    List<Event> findConflictingEvents(@Param("venueId") Long venueId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime,
                                      @Param("excludeEventId") Long excludeEventId);

    @Query("SELECT r.event FROM Registration r WHERE r.user.id = :userId AND r.status <> 'CANCELLED'")
    List<Event> findRegisteredEventsByUserId(@Param("userId") Long userId);
}
