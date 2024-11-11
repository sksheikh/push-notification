import React, { useState, useEffect } from 'react';
import { Bell, Send } from 'lucide-react';
import Pusher from 'pusher-js';

// Custom Alert Components
const Alert = ({ children, className = '' }) => (
  <div className={`p-4 rounded-lg border ${className}`}>
    {children}
  </div>
);

const AlertTitle = ({ children, className = '' }) => (
  <div className={`font-medium mb-1 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true
    });

    // Subscribe to the channel
    const channel = pusher.subscribe('notification-channel');

    // Bind to notification events
    channel.bind('new-notification', (data) => {
      const newNotification = {
        id: Date.now(),
        title: data.title || 'New Notification',
        message: data.message || 'You have a new notification',
        timestamp: new Date().toLocaleTimeString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const sendNotification = async () => {
    try {
      // Send notification through your API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `New Notification ${notifications.length + 1}`,
          message: `This is notification message ${notifications.length + 1}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  console.log('notifications:' + notifications)

  return (
    <div className="relative">
      {/* Notification Controls */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={sendNotification}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Send size={16} />
          Send Notification
        </button>
        
        <button
          onClick={toggleNotifications}
          className="relative flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 w-96 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="p-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No notifications</p>
            ) : (
              notifications.map(notification => (
                <Alert
                  key={notification.id}
                  className={`mb-2 border ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                >
                  <AlertTitle className="flex justify-between">
                    <span>{notification.title}</span>
                    <span className="text-sm text-gray-500">{notification.timestamp}</span>
                  </AlertTitle>
                  <AlertDescription>
                    {notification.message}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;