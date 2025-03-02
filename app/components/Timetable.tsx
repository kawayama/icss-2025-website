'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { venues, sessions, conferenceDays } from '../data/sessions';
import { ClipboardIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Timetable() {
  // 初期状態はサーバー側とクライアント側で同じになるようにする
  const [selectedDate, setSelectedDate] = useState<string>(conferenceDays[0]?.date || '');
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // クライアントサイドでのみlocalStorageから読み込む
  useEffect(() => {
    try {
      const storedDate = localStorage.getItem('selectedDate');
      const storedSessions = localStorage.getItem('checkedSessions');
      
      if (storedDate) {
        setSelectedDate(storedDate);
      }
      
      if (storedSessions) {
        setCheckedSessions(JSON.parse(storedSessions));
      }
    } catch (error) {
      console.error('ローカルストレージからの読み込みエラー:', error);
    }
  }, []);
  
  // 選択中のセッション数
  const selectedSessionCount = Object.values(checkedSessions).filter(Boolean).length;
  
  // 状態が変更されたらlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('selectedDate', selectedDate);
      localStorage.setItem('checkedSessions', JSON.stringify(checkedSessions));
    } catch (error) {
      console.error('ローカルストレージへの保存エラー:', error);
    }
  }, [selectedDate, checkedSessions]);
  
  // セッション切り替えハンドラー
  const handleToggleSession = (sessionId: string) => {
    setCheckedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };
  
  // 日付変更ハンドラー
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };
  
  // URLを開く
  const openSessionUrl = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    
    if (!url) {
      alert('このセッションにはURLが設定されていません。');
      return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  // 選択されたセッションをコピー
  const copySelectedSessions = () => {
    // 選択されたセッションをすべて取得
    const selectedSessions = sessions.filter(session => checkedSessions[session.id]);
    
    if (selectedSessions.length === 0) {
      alert('選択されたセッションがありません。');
      return;
    }
    
    // すべてのセッションを日付、時間、会場の順でソート
    const sortedSessions = [...selectedSessions].sort((a, b) => {
      // 1. まず日付でソート
      if (a.date !== b.date) {
        return a.date < b.date ? -1 : 1;
      }
      
      // 2. 日付が同じなら開始時間でソート
      const aStartMinutes = timeToMinutes(a.startTime);
      const bStartMinutes = timeToMinutes(b.startTime);
      
      if (aStartMinutes !== bStartMinutes) {
        return aStartMinutes - bStartMinutes;
      }
      
      // 3. 開始時間が同じなら会場名でソート（A会場→B会場の順）
      // 会場名に含まれるアルファベット部分を抽出して比較
      const getVenuePrefix = (venue: string): string => {
        // 会場名からアルファベット部分（A, B, Cなど）を抽出
        const match = venue.match(/^([A-Za-z])会場/);
        return match ? match[1].toUpperCase() : venue;
      };

      const aVenue = venues.find(v => v.id === a.venue || v.name === a.venue)?.name || a.venue;
      const bVenue = venues.find(v => v.id === b.venue || v.name === b.venue)?.name || b.venue;
      
      const aPrefixStr = getVenuePrefix(aVenue);
      const bPrefixStr = getVenuePrefix(bVenue);
      
      // まずは会場の接頭辞（A, B, Cなど）で比較
      if (aPrefixStr !== bPrefixStr) {
        return aPrefixStr.localeCompare(bPrefixStr);
      }
      
      // 接頭辞が同じなら会場名全体で比較
      return aVenue.localeCompare(bVenue);
    });
    
    // ソート済みのセッションを日付ごとにグループ化
    const sessionsByDate = sortedSessions.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = [];
      }
      acc[session.date].push(session);
      return acc;
    }, {} as Record<string, Session[]>);
    
    // 日付順にキーを取得
    const sortedDates = Object.keys(sessionsByDate).sort();
    
    // 日付ごとにセッションテキストを生成
    const text = sortedDates.map(date => {
      const dateDisplay = conferenceDays.find(day => day.date === date)?.displayName || date;
      const sessionsText = sessionsByDate[date].map(session => {
        const urlText = session.url ? `\nURL: ${session.url}` : '';
        return `${session.startTime}-${session.endTime} [${session.sessionType}] ${session.title}\n発表者: ${session.presenter}\n所属: ${session.affiliation}\n会場: ${venues.find(v => v.id === session.venue || v.name === session.venue)?.name || session.venue}${urlText}\n`;
      }).join('\n');
      
      return `【${dateDisplay}】\n${sessionsText}`;
    }).join('\n\n');
    
    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        })
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  // セッションカードのレンダリング
  const renderSessionCard = (session: Session) => {
    const isChecked = checkedSessions[session.id];
    
    return (
      <div
        className={`p-3 rounded-lg border ${
          isChecked ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'
        } hover:shadow-md transition-all duration-200 cursor-pointer text-sm h-full flex flex-col relative`}
        onClick={() => handleToggleSession(session.id)}
      >
        {isChecked && (
          <div className="absolute top-2 right-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
        )}
        
        <div className="flex items-start mb-2 gap-1 pr-6">
          <div className="font-medium text-gray-800 overflow-hidden" title={session.title}>
            <span className="block truncate">
              {session.title}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 items-center mb-2">
          <span className={`${
            session.sessionType.includes('SPT') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
            } px-2 py-0.5 rounded-full text-xs font-medium`}>
            {session.sessionType}
          </span>
          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
            {session.startTime} - {session.endTime}
          </span>
        </div>
        
        {(session.presenter || session.affiliation) && (
          <div className="text-xs mb-1 truncate" title={`${session.presenter || ''} ${session.affiliation ? `(${session.affiliation})` : ''}`}>
            {session.presenter && (
              <span className="font-medium text-gray-800">{session.presenter}</span>
            )}
            {session.presenter && session.affiliation && (
              <span className="text-gray-500 mx-1">・</span>
            )}
            {session.affiliation && (
              <span className="text-gray-500">{session.affiliation}</span>
            )}
          </div>
        )}
        
        {session.url && (
          <div className="mt-auto pt-1 flex justify-start">
            <button
              className="text-blue-600 hover:text-blue-800 inline-flex items-center text-xs gap-1 border border-blue-200 rounded-md px-1.5 py-0.5 hover:bg-blue-50 transition-colors min-w-0 overflow-hidden whitespace-nowrap"
              onClick={(e) => openSessionUrl(e, session.url)}
              title="セッションURLを開く"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">詳細</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // 時間を分単位に変換するヘルパー関数
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分を時間文字列に変換するヘルパー関数
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 時間文字列が特定の条件を満たすかチェックするヘルパー関数
  const isExactHour = (timeString: string): boolean => {
    return timeString.endsWith(':00');
  };

  const isHalfHour = (timeString: string): boolean => {
    return timeString.endsWith(':30');
  };

  // 選択された日付のすべての時間スロットを生成（5分単位）
  const generateAllTimeSlots = () => {
    // 選択された日付のセッションをフィルタリング
    const dateSessions = sessions.filter(s => s.date === selectedDate);
    
    // セッションがない場合はデフォルトの時間範囲を返す
    if (dateSessions.length === 0) {
      return generateDefaultTimeSlots();
    }
    
    // すべてのセッションの開始時間と終了時間から最小開始時間と最大終了時間を取得
    const startTimes = dateSessions.map(s => timeToMinutes(s.startTime));
    const endTimes = dateSessions.map(s => timeToMinutes(s.endTime));
    
    const minStartTime = Math.min(...startTimes);
    const maxEndTime = Math.max(...endTimes);
    
    // 5分単位のすべての時間スロットを生成
    const timeSlots: string[] = [];
    for (let minutes = minStartTime; minutes <= maxEndTime; minutes += 5) {
      timeSlots.push(minutesToTime(minutes));
    }
    
    return timeSlots;
  };
  
  // デフォルトの時間スロットを生成
  const generateDefaultTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };
  
  // CSSグリッドを使用したタイムテーブルのレンダリング
  const renderGridTimetable = () => {
    const timeSlots = generateAllTimeSlots();
    const dateSessions = sessions.filter(s => s.date === selectedDate);
    
    return (
      <div className="mt-6 shadow-lg rounded-lg overflow-x-auto border border-gray-200 bg-white">
        <div className="relative w-full">
          {/* グリッドコンテナ全体 */}
          <div className="grid" style={{ 
            gridTemplateColumns: `80px repeat(${venues.length}, minmax(220px, 1fr))`,
            width: '100%'
          }}>
            {/* ヘッダー行 - グリッドで実装 */}
            <div className="sticky top-0 z-20 bg-gray-800 text-white p-3 border-b border-gray-600 text-center font-medium">
              時間
            </div>
            {venues.map(venue => (
              <div 
                key={`header-${venue.id}`} 
                className="sticky top-0 z-20 bg-gray-800 text-white p-3 border-b border-gray-600 text-center font-medium"
              >
                {venue.name}
              </div>
            ))}

            {/* 時間スロット列 */}
            {timeSlots.map((time) => {
              // 時間表示の条件判定を関数を使って行う
              const showTimeLabel = time.endsWith('0') || time.endsWith('5');
              const isHourBoundaryTime = isExactHour(time);
              const isHalfHourTime = isHalfHour(time);
              
              // 時間のスタイル - より洗練されたデザイン
              const timeStyles = isHourBoundaryTime 
                ? 'bg-gray-100 text-gray-700 border-b border-r border-gray-100' 
                : isHalfHourTime 
                ? 'bg-gray-100 text-gray-700 border-b border-r border-gray-100' 
                : 'bg-white text-gray-500 border-b border-r border-gray-100';
              
              // セルのスタイル - より洗練されたデザイン
              const cellStyles = isHourBoundaryTime 
                ? 'border-b border-r border-gray-100 bg-white' 
                : isHalfHourTime 
                ? 'border-b border-r border-gray-100 bg-white' 
                : 'border-b border-r border-gray-100 bg-white';
              
              return (
                <React.Fragment key={`time-row-${time}`}>
                  {/* 時間セル */}
                  <div 
                    className={`sticky left-0 z-10 p-2 ${timeStyles} text-right text-sm`}
                    style={{ height: '36px' }}
                  >
                    {showTimeLabel ? time : ''}
                  </div>
                  
                  {/* 各会場の空のセル */}
                  {venues.map(venue => (
                    <div
                      key={`cell-${venue.id}-${time}`}
                      className={cellStyles}
                      style={{ height: '36px', position: 'relative' }}
                    >
                      {/* この時間スロットと会場のセッション */}
                      {dateSessions
                        .filter(session => 
                          (session.venue === venue.id || session.venue === venue.name) &&
                          session.startTime === time
                        )
                        .map(session => {
                          const startTimeIndex = timeSlots.indexOf(session.startTime);
                          const endTimeIndex = timeSlots.indexOf(session.endTime);
                          const duration = endTimeIndex !== -1 
                            ? endTimeIndex - startTimeIndex 
                            : Math.ceil((timeToMinutes(session.endTime) - timeToMinutes(session.startTime)) / 5);
                          
                          return (
                            <div
                              key={`session-${session.id}`}
                              className="absolute left-0 right-0 z-10 p-2 overflow-hidden"
                              style={{ 
                                top: 0,
                                height: `${duration * 36}px`,
                                minHeight: '36px'
                              }}
                            >
                              {renderSessionCard(session)}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // // 表示する選択中の日付
  // const selectedDayDisplay = conferenceDays.find(day => day.date === selectedDate)?.displayName || '';
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          ICSS/SPT 2025 タイムテーブル
        </h1>
        <p className="text-center text-gray-600 mb-6">
          セッションをクリックして選択し、スケジュールをカスタマイズできます
        </p>
        
        {/* 日付選択タブ */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {conferenceDays.map(day => (
              <button
                key={day.date}
                onClick={() => handleDateChange(day.date)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  selectedDate === day.date
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${
                  conferenceDays.indexOf(day) === 0
                    ? 'rounded-l-lg'
                    : conferenceDays.indexOf(day) === conferenceDays.length - 1
                    ? 'rounded-r-lg'
                    : ''
                } border border-gray-300`}
              >
                {day.displayName}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {renderGridTimetable()}
      
      {/* 右下にフローティングのコピーボタン */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative">
          {/* クリアボタンを削除 */}

          <button
            onClick={copySelectedSessions}
            disabled={selectedSessionCount === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
              selectedSessionCount > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ClipboardIcon className="h-5 w-5" />
            <span>選択した{selectedSessionCount > 0 ? selectedSessionCount + '件の' : ''}公演をコピー</span>
          </button>
          
          {showCopySuccess && (
            <div className="absolute top-0 right-0 transform translate-y-[-100%] mt-[-8px] px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md shadow-md border border-green-200 whitespace-nowrap">
              コピーしました！
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>© 2025 ICSS/SPT タイムテーブル | Made with ❤️ by a 暇人</p>
        <p className="mt-1 text-xs">選択したセッションはローカルに保存されます</p>
      </footer>
    </div>
  );
}
