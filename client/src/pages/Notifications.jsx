import { useState } from "react";
import { notifications as mockNotifications } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import NotificationItem from "../components/NotificationItem";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function Notifications() {
  // TODO (backend): load with api.get("/api/notifications")
  // TODO (Socket.IO): when the socket receives a "notification" event, do
  //   setItems((prev) => [newNotification, ...prev]);
  const [items, setItems] = useState(mockNotifications);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader title="Notifications" subtitle={unread ? `${unread} unread` : "You are all caught up."}
        action={unread > 0 && <Button variant="secondary" onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}>Mark all as read</Button>} />
      {items.length === 0 ? (
        <EmptyState icon="bell" title="No notifications" message="Updates about events and clubs will appear here." />
      ) : (
        <div className="space-y-3">{items.map((n) => <NotificationItem key={n._id} item={n} />)}</div>
      )}
    </div>
  );
}