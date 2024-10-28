import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityCard, User, TaskItem } from '../types/types';

interface Props {
  cards: ActivityCard[];
  users: User[];
}

export default function Summary({ cards = [], users = [] }: Props) {
  const [selectedWeekOffset, setSelectedWeekOffset] = React.useState(0);
  const [selectedCard, setSelectedCard] = React.useState<ActivityCard | null>(null);

  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff + (offset * 7)));
    monday.setHours(0, 0, 0, 0);
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const groupCardsByDateAndUser = () => {
    const weekDates = getWeekDates(selectedWeekOffset);
    const grouped: Record<string, Record<string, ActivityCard | null>> = {};

    weekDates.forEach(date => {
      const dateKey = formatDateKey(date);
      grouped[dateKey] = {};
      users.forEach(user => {
        grouped[dateKey][user.id] = null;
      });
    });

    cards.forEach(card => {
      if (!card) return;
      const cardDate = new Date(card.date);
      const matchingWeekDate = weekDates.find(date => isSameDay(date, cardDate));
      
      if (matchingWeekDate && card.user_id) {
        const dateKey = formatDateKey(matchingWeekDate);
        grouped[dateKey][card.user_id] = card;
      }
    });

    return grouped;
  };

  const weekDates = getWeekDates(selectedWeekOffset);
  const groupedCards = groupCardsByDateAndUser();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatWeekRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getCardStats = (card: ActivityCard | null) => {
    if (!card) return { totalItems: 0, totalHours: 0 };
    
    const totalItems = (card.what_i_did?.length || 0) + 
                      (card.what_broke?.length || 0) + 
                      (card.how_i_fixed?.length || 0) + 
                      (card.tasks_for_tomorrow?.length || 0);
    
    const totalHours = (card.what_i_did || []).reduce((acc, item: TaskItem) => 
      acc + (item.time_estimate || 0), 0) + (card.admin_time || 0) + (card.meeting_time || 0);
    
    return { totalItems, totalHours };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Weekly Summary</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 font-medium">
              {formatWeekRange(weekStart, weekEnd)}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedWeekOffset(prev => prev - 1)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedWeekOffset(0)}
                className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedWeekOffset(prev => prev + 1)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Team Member</th>
              {weekDates.map(date => (
                <th key={formatDateKey(date)} className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-100">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                {weekDates.map(date => {
                  const dateKey = formatDateKey(date);
                  const card = groupedCards[dateKey]?.[user.id];
                  const stats = getCardStats(card);
                  
                  return (
                    <td key={dateKey} className="px-4 py-4">
                      {card ? (
                        <button
                          onClick={() => setSelectedCard(card === selectedCard ? null : card)}
                          className={`text-sm text-left w-full rounded-lg p-2 transition-colors ${
                            card === selectedCard
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {stats.totalHours.toFixed(1)}h
                          </div>
                          <div className="text-gray-500">
                            {stats.totalItems} items
                          </div>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No entry</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCard && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {users.find(u => u.id === selectedCard.user_id)?.name}'s Activity -
              {' '}
              {new Date(selectedCard.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>
          <div className="space-y-8">
            {selectedCard.what_i_did.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">What I Did</h4>
                <ul className="space-y-2">
                  {selectedCard.what_i_did.map((item: TaskItem, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="flex-1" style={{ whiteSpace: 'pre-wrap' }}>{item.text}</span>
                      <span className="text-gray-500 text-sm">{item.time_estimate?.toFixed(1)}h</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCard.what_broke.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">What Broke</h4>
                <ul className="space-y-2">
                  {selectedCard.what_broke.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="flex-1" style={{ whiteSpace: 'pre-wrap' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCard.how_i_fixed.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">How I Fixed It</h4>
                <ul className="space-y-2">
                  {selectedCard.how_i_fixed.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="flex-1" style={{ whiteSpace: 'pre-wrap' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCard.tasks_for_tomorrow.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Tasks for Tomorrow</h4>
                <ul className="space-y-2">
                  {selectedCard.tasks_for_tomorrow.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="flex-1" style={{ whiteSpace: 'pre-wrap' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Admin Time:</span>
                  <span className="font-medium">{selectedCard.admin_time?.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Meeting Time:</span>
                  <span className="font-medium">{selectedCard.meeting_time?.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}