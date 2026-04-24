import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { Bell, Calendar, Heart, Eye, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
    fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/my-notifications");
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      );
      setNotifications(updatedNotifications);
      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.is_read,
      ).length;
      setUnreadCount(newUnreadCount);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        is_read: true,
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      // Remove from state immediately
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      setNotifications(updatedNotifications);
      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.is_read,
      ).length;
      setUnreadCount(newUnreadCount);
      toast.success("Notification deleted");
    } catch (err) {
      // If 404, still remove from UI
      if (err.response?.status === 404) {
        const updatedNotifications = notifications.filter((n) => n.id !== id);
        setNotifications(updatedNotifications);
        toast.success("Notification removed");
      } else {
        console.error("Error:", err);
        toast.error("Failed to delete");
      }
    }
  };

  const deleteAllNotifications = async () => {
    if (window.confirm("⚠️ Delete ALL notifications? This cannot be undone!")) {
      try {
        await api.delete("/notifications/delete-all");
        setNotifications([]);
        setUnreadCount(0);
        toast.success("All notifications deleted");
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to delete");
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-5 h-5 text-green-500" />;
      case "wishlist":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "event_view":
        return <Eye className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete all
                  </button>
                )}
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
              <Link to="/" className="mt-4 inline-block text-orange-500">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-6 hover:bg-gray-50 bg-gray-200 transition ${
                    !notif.is_read ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {notif.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.created_at).toLocaleDateString()} at{" "}
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs text-green-500 hover:text-green-600"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
