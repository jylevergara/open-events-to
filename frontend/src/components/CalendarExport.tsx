import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { Event } from '../services/api';

interface CalendarExportProps {
  events: Event[];
  disabled?: boolean;
}

export const CalendarExport: React.FC<CalendarExportProps> = ({
  events,
  disabled = false,
}) => {
  const generateICSContent = (events: Event[]): string => {
    const icsHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Toronto Events//Toronto Events App//EN',
      'CALSCALE:GREGORIAN',
    ].join('\r\n');

    const icsFooter = 'END:VCALENDAR';

    const icsEvents = events.map((event) => {
      const formatDate = (dateStr: string, timeStr?: string): string => {
        try {
          const date = new Date(dateStr);
          if (timeStr) {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            if (period?.toLowerCase() === 'pm' && hour !== 12) {
              hour += 12;
            } else if (period?.toLowerCase() === 'am' && hour === 12) {
              hour = 0;
            }
            date.setHours(hour, parseInt(minutes) || 0);
          }
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        } catch {
          return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
      };

      const startDate = formatDate(event.DateBeginShow, event.TimeBegin);
      const endDate = event.DateEndShow 
        ? formatDate(event.DateEndShow, event.TimeEnd)
        : formatDate(event.DateBeginShow, event.TimeEnd || '23:59');

      const description = Array.isArray(event.LongDesc) 
        ? event.LongDesc.join(' ') 
        : event.LongDesc || '';

      const categories = Array.isArray(event.CategoryList)
        ? event.CategoryList.join(', ')
        : event.CategoryList || '';

      return [
        'BEGIN:VEVENT',
        `UID:${event.id}@toronto-events-app.com`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.EventName}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        `LOCATION:${event.Area || 'Toronto'}`,
        `CATEGORIES:${categories}`,
        event.PresentedByOrgName && `ORGANIZER:CN=${event.PresentedByOrgName}`,
        event.Admission && `X-ADMISSION:${event.Admission}`,
        `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'END:VEVENT',
      ].filter(Boolean).join('\r\n');
    }).join('\r\n');

    return [icsHeader, icsEvents, icsFooter].join('\r\n');
  };

  const handleExport = () => {
    if (events.length === 0) return;

    // For single event, try to open calendar app directly
    if (events.length === 1) {
      const success = openInCalendarApp(events[0]);
      if (success) return;
    }

    // For multiple events or if calendar app opening fails, fall back to ICS download
    const icsContent = generateICSContent(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `toronto-events-favorites-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openInCalendarApp = (event: Event): boolean => {
    try {
      const formatDateForUrl = (dateStr: string, timeStr?: string): string => {
        const date = new Date(dateStr);
        if (timeStr) {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':');
          let hour = parseInt(hours);
          if (period?.toLowerCase() === 'pm' && hour !== 12) {
            hour += 12;
          } else if (period?.toLowerCase() === 'am' && hour === 12) {
            hour = 0;
          }
          date.setHours(hour, parseInt(minutes) || 0);
        }
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const startDate = formatDateForUrl(event.DateBeginShow, event.TimeBegin);
      const endDate = event.DateEndShow 
        ? formatDateForUrl(event.DateEndShow, event.TimeEnd)
        : formatDateForUrl(event.DateBeginShow, event.TimeEnd || '23:59');

      const description = Array.isArray(event.LongDesc) 
        ? event.LongDesc.join(' ') 
        : event.LongDesc || '';

      const location = event.Area || 'Toronto';

      // Create Google Calendar URL (works on most platforms)
      const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
      googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
      googleCalendarUrl.searchParams.set('text', event.EventName);
      googleCalendarUrl.searchParams.set('dates', `${startDate}/${endDate}`);
      googleCalendarUrl.searchParams.set('details', description);
      googleCalendarUrl.searchParams.set('location', location);
      if (event.PresentedByOrgName) {
        googleCalendarUrl.searchParams.set('organizer', event.PresentedByOrgName);
      }

      // Try to open the calendar URL
      window.open(googleCalendarUrl.toString(), '_blank');
      return true;
    } catch (error) {
      console.error('Failed to open calendar app:', error);
      return false;
    }
  };

  return (
    <Tooltip 
      title={
        events.length === 0 
          ? 'No favorite events to export' 
          : `Export ${events.length} favorite event${events.length > 1 ? 's' : ''} to calendar`
      }
    >
      <span>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
          disabled={disabled || events.length === 0}
          size="small"
        >
          Export to Calendar
        </Button>
      </span>
    </Tooltip>
  );
};

export default CalendarExport;
