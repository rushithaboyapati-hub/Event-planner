package com.eventplanner.dto;

import java.util.List;

public class ConflictCheckResponse {

    private boolean hasConflict;
    private List<EventResponse> conflictingEvents;

    public ConflictCheckResponse(boolean hasConflict, List<EventResponse> conflictingEvents) {
        this.hasConflict = hasConflict;
        this.conflictingEvents = conflictingEvents;
    }

    public boolean isHasConflict() { return hasConflict; }
    public void setHasConflict(boolean hasConflict) { this.hasConflict = hasConflict; }
    public List<EventResponse> getConflictingEvents() { return conflictingEvents; }
    public void setConflictingEvents(List<EventResponse> conflictingEvents) { this.conflictingEvents = conflictingEvents; }
}
