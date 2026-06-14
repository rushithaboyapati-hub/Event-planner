import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

export default function Calendar({ userId }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    eventService.getCalendar({ startDate: start.toISOString(), endDate: end.toISOString() })
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false));
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (d) =>
    events.filter(e => isSameDay(new Date(e.startTime), d));

  return (
    <div>
      <div className="calendar-header">
        <button className="btn btn-outline btn-sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>← Prev</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button className="btn btn-outline btn-sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next →</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="calendar-grid">
          {dayHeaders.map(h => <div key={h} className="calendar-day-header">{h}</div>)}
          {days.map(d => {
            const dayEvents = getEventsForDay(d);
            return (
              <div key={d.toISOString()}
                   className={`calendar-day ${!isSameMonth(d, currentDate) ? 'other-month' : ''} ${isToday(d) ? 'today' : ''}`}>
                <div className="day-number">{format(d, 'd')}</div>
                {dayEvents.map(e => (
                  <div key={e.id} className="calendar-event" onClick={() => navigate(`/events/${e.id}`)}
                       title={`${e.title} at ${format(new Date(e.startTime), 'HH:mm')}`}>
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2">
        <h3 className="mb-1">Events This Month</h3>
        {events.length === 0 ? <p className="text-muted">No events this month</p> : (
          <div className="grid grid-2">
            {events.map(e => (
              <div key={e.id} className="card event-card" onClick={() => navigate(`/events/${e.id}`)}>
                <div className="flex-between">
                  <strong>{e.title}</strong>
                  <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                </div>
                <p className="text-sm text-muted mt-1">
                  {format(new Date(e.startTime), 'MMM d, yyyy HH:mm')} - {format(new Date(e.endTime), 'HH:mm')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
