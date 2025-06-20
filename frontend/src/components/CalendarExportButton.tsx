import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { Event } from '../services/api';

interface CalendarExportButtonProps {
  event: Event;
  size?: 'small' | 'medium' | 'large';
}

export const CalendarExportButton: React.FC<CalendarExportButtonProps> = ({
  event,
  size = 'small',
}) => {
  const generateICSContent = (event: Event): string => {
    const icsHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Toronto Events//Toronto Events App//EN',
      'CALSCALE:GREGORIAN',
    ].join('\r\n');

    const icsFooter = 'END:VCALENDAR';

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

    const icsEvent = [
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

    return [icsHeader, icsEvent, icsFooter].join('\r\n');
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked

    // Try to open calendar app directly first
    const success = openInCalendarApp(event);
    
    // If calendar app opening fails, fall back to ICS download
    if (!success) {
      const icsContent = generateICSContent(event);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.EventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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
    <Tooltip title="Add to calendar">
      <IconButton
        onClick={handleExport}
        size={size}
        color="default"
        aria-label="Add to calendar"
      >
        <CalendarMonth />
      </IconButton>
    </Tooltip>
  );
};

export default CalendarExportButton;
