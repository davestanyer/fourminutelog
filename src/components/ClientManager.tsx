import React, { useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Client } from '../types/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSaveClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  defaultClientId?: string | null;
  onSetDefaultClient: (clientId: string | null) => void;
}

const EMOJI_OPTIONS = ['👨‍💻', '🏢', '⚡', '🚀', '💻', '📱', '🌐', '📊', '💡', '🎯'];
const COLOR_PRESETS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];
const CLIENTS_PER_PAGE = 5;

const DEFAULT_CLIENT = {
  name: '',
  emoji: '👨‍💻',
  color: '#3B82F6',
  tag: ''
};

export default function ClientManager({
  isOpen,
  onClose,
  clients,
  onSaveClient,
  onUpdateClient,
  onDeleteClient,
  defaultClientId,
  onSetDefaultClient
}: Props) {
  const [newClient, setNewClient] = useState(DEFAULT_CLIENT);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(clients.length / CLIENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
  const endIndex = startIndex + CLIENTS_PER_PAGE;
  const currentClients = clients.slice(startIndex, endIndex);

  const resetForm = () => {
    setNewClient(DEFAULT_CLIENT);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check for duplicate tags
      const isDuplicateTag = clients.some(
        client => client.tag.toLowerCase() === newClient.tag.toLowerCase()
      );

      if (isDuplicateTag) {
        throw new Error(`A client with tag ${newClient.tag} already exists`);
      }

      // Create new client object
      const clientData = {
        ...newClient,
        tag: newClient.tag.toUpperCase(),
        name: newClient.name.trim()
      };

      await onSaveClient(clientData);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <input
                type="text"
                value={newClient.tag}
                onChange={(e) => setNewClient(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tag (e.g., CLIENT1)"
                required
                pattern="[A-Z0-9]+"
                maxLength={10}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emoji
              </label>
              <div className="grid grid-cols-5 gap-2 p-2 border rounded-lg">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewClient(prev => ({ ...prev, emoji }))}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors ${
                      newClient.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewClient(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg hover:scale-110 transition-transform ${
                      newClient.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </form>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Clients</h3>
            <div className="space-y-3">
              {currentClients.map(client => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{client.emoji}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{client.name}</h4>
                      <span
                        className="inline-block px-2 py-1 text-sm rounded"
                        style={{
                          backgroundColor: `${client.color}15`,
                          color: client.color
                        }}
                      >
                        {client.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSetDefaultClient(
                        defaultClientId === client.id ? null : client.id
                      )}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        defaultClientId === client.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {defaultClientId === client.id ? 'Default' : 'Set Default'}
                    </button>
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}