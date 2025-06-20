import React, { useState, useEffect } from 'react';
import { Shield, Download, RefreshCw, Filter, AlertTriangle, Eye, Calendar } from 'lucide-react';
import { getSecurityLogs, clearSecurityLogs, SecurityEvent } from '../../utils/adminSecurity';

const AdminSecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('24h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filter, dateFilter]);

  const loadLogs = () => {
    setLoading(true);
    try {
      const securityLogs = getSecurityLogs();
      setLogs(securityLogs.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply event type filter
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.event.includes(filter));
    }

    // Apply date filter
    const now = new Date();
    let cutoffDate: Date;

    switch (dateFilter) {
      case '1h':
        cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0); // Show all
    }

    filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);

    setFilteredLogs(filtered);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all security logs? This action cannot be undone.')) {
      clearSecurityLogs();
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (event: string) => {
    if (event.includes('denied') || event.includes('error') || event.includes('invalid')) {
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    }
    if (event.includes('attempt') || event.includes('validation')) {
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    }
    if (event.includes('granted') || event.includes('validated')) {
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    }
    return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
  };

  const formatEventName = (event: string) => {
    return event
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!import.meta.env.DEV) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Security Logs Unavailable
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Security logs are only available in development mode.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor admin panel access and security events
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-lg text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Events</option>
                <option value="access">Access Events</option>
                <option value="denied">Denied Events</option>
                <option value="error">Error Events</option>
                <option value="validation">Validation Events</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredLogs.length} of {logs.length} events
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Security Events
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {logs.length === 0 ? 'No security events have been logged yet.' : 'No events match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.event)}`}>
                        {formatEventName(log.event)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.userEmail || log.userId || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedEvent(log)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedEvent(null)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Security Event Details
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatEventName(selectedEvent.event)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedEvent.userEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedEvent.userEmail}</p>
                  </div>
                )}
                
                {selectedEvent.userId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{selectedEvent.userId}</p>
                  </div>
                )}
                
                {selectedEvent.sessionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session ID</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{selectedEvent.sessionId}</p>
                  </div>
                )}
                
                {selectedEvent.userAgent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white break-all">{selectedEvent.userAgent}</p>
                  </div>
                )}
                
                {selectedEvent.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                    <pre className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityLogs;