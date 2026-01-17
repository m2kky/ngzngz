export function getGoogleCalendarLink(meeting: {
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
}) {
  const start = new Date(meeting.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const end = new Date(meeting.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    dates: `${start}/${end}`,
    details: meeting.description || '',
    location: meeting.location || '',
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarLink(meeting: {
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
}) {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: meeting.title,
    startdt: meeting.start_time,
    enddt: meeting.end_time,
    body: meeting.description || '',
    location: meeting.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
