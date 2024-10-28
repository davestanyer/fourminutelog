import React, { useState, useRef, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { TaskItem, Client } from '../types/types';

interface Props {
  title: string;
  items?: (string | TaskItem)[];
  isEditing?: boolean;
  onSave?: (items: (string | TaskItem)[]) => void;
  showTimeEstimate?: boolean;
  adminTime?: number;
  meetingTime?: number;
  onAdminTimeChange?: (value: number) => void;
  onMeetingTimeChange?: (value: number) => void;
  clients?: Client[];
  defaultClientId?: string | null;
}

const isTaskItem = (item: string | TaskItem): item is TaskItem => {
  return typeof item !== 'string' && item !== null && typeof item === 'object';
};

const getSectionColor = (title: string) => {
  switch (title.toLowerCase()) {
    case 'what i did':
      return 'bg-blue-100 text-blue-700';
    case 'what broke':
      return 'bg-red-100 text-red-700';
    case 'how i fixed it':
      return 'bg-green-100 text-green-700';
    case 'tasks for tomorrow':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function Section({
  title,
  items = [],
  isEditing,
  onSave,
  showTimeEstimate = false,
  adminTime = 0,
  meetingTime = 0,
  onAdminTimeChange,
  onMeetingTimeChange,
  clients = [],
  defaultClientId
}: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [timeInputs, setTimeInputs] = useState<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const adminTimeRef = useRef<HTMLInputElement>(null);
  const meetingTimeRef = useRef<HTMLInputElement>(null);
  const safeItems = items || [];

  const totalTaskTime = safeItems.reduce((total, item) => {
    return total + (isTaskItem(item) ? (item.time_estimate || 0) : 0);
  }, 0);

  useEffect(() => {
    timeInputRefs.current = timeInputRefs.current.slice(0, safeItems.length);
  }, [safeItems]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentInput]);

  const handleItemClick = (index: number) => {
    if (!isEditing) return;
    setEditingIndex(index);
    const item = safeItems[index];
    setCurrentInput(isTaskItem(item) ? item.text : item);
  };

  const handleDeleteItem = (index: number) => {
    if (!onSave) return;
    const newItems = [...safeItems];
    newItems.splice(index, 1);
    onSave(newItems);
  };

  const handleTimeChange = (index: number, value: string) => {
    setTimeInputs(prev => ({ ...prev, [index]: value }));
  };

  const handleTimeBlur = (index: number) => {
    if (!onSave) return;
    const newItems = [...safeItems];
    const item = newItems[index];
    if (isTaskItem(item)) {
      const numericValue = parseFloat(timeInputs[index]) || 0;
      newItems[index] = { 
        ...item, 
        time_estimate: Number(numericValue.toFixed(1))
      };
      onSave(newItems);
    }
    setTimeInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[index];
      return newInputs;
    });
  };

  const focusNextInput = (currentIndex: number) => {
    // Save current value
    handleTimeBlur(currentIndex);

    // Find next input to focus
    if (currentIndex < safeItems.length - 1) {
      // Focus next time input
      timeInputRefs.current[currentIndex + 1]?.focus();
    } else if (adminTimeRef.current) {
      // Focus admin time input
      adminTimeRef.current.focus();
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      focusNextInput(index);
    }
  };

  const handleAdminTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (onAdminTimeChange) {
        const value = parseFloat(e.currentTarget.value) || 0;
        onAdminTimeChange(Number(value.toFixed(1)));
      }
      meetingTimeRef.current?.focus();
    }
  };

  const handleMeetingTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      if (onMeetingTimeChange) {
        const value = parseFloat(e.currentTarget.value) || 0;
        onMeetingTimeChange(Number(value.toFixed(1)));
      }
    }
  };

  const handleTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleClientTagChange = (index: number, clientId: string) => {
    if (!onSave) return;
    const newItems = [...safeItems];
    const item = newItems[index];
    if (isTaskItem(item)) {
      newItems[index] = { ...item, client_id: clientId || undefined };
      onSave(newItems);
    }
  };

  const saveCurrentInput = () => {
    if (!currentInput.trim() || !onSave) return;

    const newItems = [...safeItems];
    const newItem = showTimeEstimate 
      ? { 
          text: currentInput.trim(), 
          time_estimate: 0,
          client_id: defaultClientId || undefined
        }
      : currentInput.trim();

    if (editingIndex !== null) {
      newItems[editingIndex] = newItem;
    } else {
      newItems.push(newItem);
    }

    onSave(newItems);
    setCurrentInput('');
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveCurrentInput();
    }
  };

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium mb-4 ${getSectionColor(title)}`}>
        {title}
      </div>
      <ul className="space-y-3">
        {safeItems.map((item, index) => {
          const isTask = isTaskItem(item);
          const taskItem = isTask ? item : null;
          const client = taskItem?.client_id ? clients.find(c => c.id === taskItem.client_id) : null;
          
          return (
            <li
              key={index}
              className={`flex items-start space-x-2 group ${
                isEditing ? 'cursor-pointer hover:bg-gray-50 rounded-lg -mx-2 px-2 py-1' : ''
              }`}
            >
              <span className="text-gray-400 mt-1">•</span>
              <div className="flex-1 flex items-start justify-between">
                <span className="flex-1 relative group" onClick={() => handleItemClick(index)}>
                  {editingIndex === index ? (
                    <textarea
                      ref={inputRef}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full resize-none overflow-hidden bg-transparent focus:outline-none"
                      rows={1}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span style={{ whiteSpace: 'pre-wrap' }}>
                        {isTask ? item.text : item}
                      </span>
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(index);
                          }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </>
                  )}
                </span>
                <div className="flex items-center space-x-2 ml-2">
                  {showTimeEstimate && isTask && (
                    <>
                      <div className="relative flex items-center">
                        {client ? (
                          <div 
                            className="flex items-center space-x-1 px-2 py-1 rounded text-sm"
                            style={{ 
                              backgroundColor: `${client.color}15`,
                              color: client.color,
                              borderColor: `${client.color}30`,
                              borderWidth: '1px'
                            }}
                          >
                            <span>{client.emoji}</span>
                            <span>{client.tag}</span>
                          </div>
                        ) : (
                          <button
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                            title="Add client tag"
                          >
                            <Tag size={16} />
                          </button>
                        )}
                        {isEditing && (
                          <select
                            value={item.client_id || ''}
                            onChange={(e) => handleClientTagChange(index, e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          >
                            <option value="">No client</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.emoji} {client.name} ({client.tag})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <input
                        ref={el => timeInputRefs.current[index] = el}
                        type="text"
                        value={timeInputs[index] ?? item.time_estimate?.toFixed(1) ?? '0.0'}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        onBlur={() => handleTimeBlur(index)}
                        onKeyDown={(e) => handleTimeKeyDown(e, index)}
                        onFocus={handleTimeFocus}
                        className="w-20 px-2 py-1 text-right border rounded-md text-sm"
                      />
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {isEditing && editingIndex === null && (
          <li className="flex items-start space-x-2">
            <span className="text-gray-400 mt-1">•</span>
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add new item... (Press Enter to save)"
              className="flex-1 resize-none overflow-hidden bg-transparent focus:outline-none"
              rows={1}
            />
          </li>
        )}
      </ul>

      {showTimeEstimate && (
        <div className="mt-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tasks Total:</span>
              <span className="font-medium">{totalTaskTime.toFixed(1)}h</span>
            </div>
            {(onAdminTimeChange || onMeetingTimeChange) && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="adminTime" className="text-gray-600">Admin Time:</label>
                  <input
                    id="adminTime"
                    ref={adminTimeRef}
                    type="text"
                    value={adminTime.toFixed(1)}
                    onChange={(e) => onAdminTimeChange?.(parseFloat(e.target.value) || 0)}
                    onBlur={(e) => onAdminTimeChange?.(Number(parseFloat(e.target.value || '0').toFixed(1)))}
                    onKeyDown={handleAdminTimeKeyDown}
                    onFocus={handleTimeFocus}
                    className="w-20 px-2 py-1 text-right border rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="meetingTime" className="text-gray-600">Meeting Time:</label>
                  <input
                    id="meetingTime"
                    ref={meetingTimeRef}
                    type="text"
                    value={meetingTime.toFixed(1)}
                    onChange={(e) => onMeetingTimeChange?.(parseFloat(e.target.value) || 0)}
                    onBlur={(e) => onMeetingTimeChange?.(Number(parseFloat(e.target.value || '0').toFixed(1)))}
                    onKeyDown={handleMeetingTimeKeyDown}
                    onFocus={handleTimeFocus}
                    className="w-20 px-2 py-1 text-right border rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between text-sm font-medium pt-2 border-t">
                  <span>Total Time:</span>
                  <span>{(totalTaskTime + adminTime + meetingTime).toFixed(1)}h</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}