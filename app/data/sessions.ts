import { Session, Venue, ConferenceDay } from '../types';
import sessionsData from './sessions.json';

export const venues: Venue[] = sessionsData.venues;
export const conferenceDays: ConferenceDay[] = sessionsData.conferenceDays;
export const sessions: Session[] = sessionsData.sessions as Session[];

// 時間スロットを生成するヘルパー関数
export const generateTimeSlots = (date: string) => {
  // 選択された日付のセッションをフィルタリング
  const filteredSessions = sessions.filter(session => session.date === date);
  console.log('フィルタリングされたセッション:', date, filteredSessions.length, filteredSessions);
  
  // 確認用: 実際のセッションの日付一覧
  const uniqueDates = [...new Set(sessions.map(s => s.date))];
  console.log('利用可能なセッション日付:', uniqueDates);
  
  // 会場IDを確認
  console.log('会場一覧:', venues);
  console.log('セッションの会場:', [...new Set(filteredSessions.map(s => s.venue))]);
  
  // セッションから時間範囲を抽出
  const allTimes = new Set<string>();
  
  // すべてのセッションの開始時間と終了時間を収集
  filteredSessions.forEach(session => {
    // 開始時間と終了時間を解析
    const startHour = parseInt(session.startTime.split(':')[0]);
    const startMinute = parseInt(session.startTime.split(':')[1]);
    const endHour = parseInt(session.endTime.split(':')[0]);
    const endMinute = parseInt(session.endTime.split(':')[1]);
    
    // 開始時間から終了時間までの5分間隔のすべての時間を生成
    let currentHour = startHour;
    let currentMinute = Math.floor(startMinute / 5) * 5; // 5分間隔に丸める
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      allTimes.add(timeString);
      
      // 5分進める
      currentMinute += 5;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    // 終了時間も追加
    allTimes.add(session.endTime);
  });
  
  // すべての時間をソート
  const times = Array.from(allTimes).sort();
  
  // タイムスロットがない場合（セッションがない場合）、デフォルトの時間範囲を提供
  if (times.length === 0) {
    // 10:00から15:00までの30分間隔のデフォルト時間を設定
    for (let hour = 10; hour <= 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 15 && minute > 0) break; // 15:00以降はスキップ
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    times.sort();
  }
  
  return times.map(time => {
    const sessionsInSlot: Record<string, Session | null> = {};
    venues.forEach(venue => {
      const matchedSession = filteredSessions.find(
        session => 
          session.startTime <= time && 
          session.endTime > time && 
          (session.venue === venue.id || session.venue === venue.name)
      );
      sessionsInSlot[venue.id] = matchedSession || null;
    });
    
    return {
      time,
      sessions: sessionsInSlot
    };
  });
};
