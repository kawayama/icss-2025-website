export interface Session {
  id: string;
  title: string;
  presenter: string;
  affiliation: string;
  date: string; // 2025-03-06 のような形式
  startTime: string;
  endTime: string;
  venue: string;
  sessionType: 'ICSS' | 'SPT';
  url?: string; // オプショナルなURL
}

export interface TimeSlot {
  time: string;
  sessions: Record<string, Session | null>;
}

export interface Venue {
  id: string;
  name: string;
}

export interface ConferenceDay {
  date: string; // 2025-03-06
  displayName: string; // 3月6日（木）
}
