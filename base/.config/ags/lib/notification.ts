import Notifd from 'gi://AstalNotifd';

export function sendNotification(properties: Partial<Notifd.Notification.ConstructorProps>) {
  const notification = new Notifd.Notification(properties);
  try {
    Notifd.send_notification(notification, null);
  } catch (err) {
    console.error('Failed to send notification', err);
  }
}
