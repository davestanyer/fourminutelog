import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Calendar } from 'lucide-react';
import type { ActivityCard, User as UserType, TaskItem, Client } from '../types/types';
import Section from './Section';
import { useClients } from '../hooks/useSupabase';

interface Props {
  card: ActivityCard;
  onSave: (card: ActivityCard) => void;
  onDelete: (cardId: string) => void;
  currentUser: string | null;
  users: UserType[];
  defaultClientId?: string | null;
}

export default function ActivityCard({ 
  card, 
  onSave, 
  onDelete, 
  currentUser, 
  users = [], 
  defaultClientId 
}: Props) {
  const [editedCard, setEditedCard] = useState<ActivityCard>(card);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const { clients } = useClients();
  
  const cardUser = users.find(user => user.id === card.user_id) || {
    id: card.user_id,
    name: 'Unknown User',
    avatar: 'https://via.placeholder.com/40'
  };

  useEffect(() => {
    setEditedCard(card);
  }, [card]);

  const isOwner = card.user_id === currentUser;

  const handleSave = (section: keyof ActivityCard, value: string[] | TaskItem[]) => {
    const updatedCard = {
      ...editedCard,
      [section]: value,
      last_updated: new Date().toISOString()
    };
    setEditedCard(updatedCard);
    onSave(updatedCard);
  };

  const handleTimeChange = (type: 'admin_time' | 'meeting_time', value: number) => {
    const updatedCard = {
      ...editedCard,
      [type]: value,
      last_updated: new Date().toISOString()
    };
    setEditedCard(updatedCard);
    onSave(updatedCard);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCard = {
      ...editedCard,
      date: new Date(e.target.value).toISOString(),
      last_updated: new Date().toISOString()
    };
    setEditedCard(updatedCard);
    onSave(updatedCard);
    setIsEditingDate(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={cardUser.avatar}
            alt={cardUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{cardUser.name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={14} className="mr-1.5" />
              <div className="flex items-center">
                {isEditingDate ? (
                  <input
                    type="date"
                    value={new Date(editedCard.date).toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="input-clean w-32"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => isOwner && setIsEditingDate(true)}
                    className={`flex items-center ${isOwner ? 'hover:text-blue-600' : ''}`}
                    disabled={!isOwner}
                  >
                    <span>{formatDate(card.date)}</span>
                    {isOwner && <Calendar size={14} className="ml-1.5 text-gray-400" />}
                  </button>
                )}
                <span className="mx-2">•</span>
                <span>Updated {formatDate(card.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(card.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Delete card"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Section
          title="What I Did"
          items={editedCard.what_i_did}
          isEditing={isOwner}
          onSave={(items) => handleSave('what_i_did', items)}
          showTimeEstimate={true}
          adminTime={editedCard.admin_time}
          meetingTime={editedCard.meeting_time}
          onAdminTimeChange={(time) => handleTimeChange('admin_time', time)}
          onMeetingTimeChange={(time) => handleTimeChange('meeting_time', time)}
          defaultClientId={defaultClientId}
          clients={clients}
        />
        <Section
          title="What Broke"
          items={editedCard.what_broke}
          isEditing={isOwner}
          onSave={(items) => handleSave('what_broke', items as string[])}
        />
        <Section
          title="How I Fixed It"
          items={editedCard.how_i_fixed}
          isEditing={isOwner}
          onSave={(items) => handleSave('how_i_fixed', items as string[])}
        />
        <Section
          title="Tasks for Tomorrow"
          items={editedCard.tasks_for_tomorrow}
          isEditing={isOwner}
          onSave={(items) => handleSave('tasks_for_tomorrow', items as string[])}
        />
      </div>
    </div>
  );
}