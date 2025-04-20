import { MarkerType } from "@/types";
import * as Notifications from 'expo-notifications';

export interface ActiveNotification {
  markerId: number;
  notificationId: string;
  timestamp: number;
}

export class NotificationManager {
  private activeNotifications: Map<number, ActiveNotification>;

  constructor() {
    this.activeNotifications = new Map();
  }

  async showNotification(marker: MarkerType): Promise<void> {
    if (this.activeNotifications.has(marker.id)) {
      console.log("Уведомление уже активно для этого маркера:", marker.id);
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Вы рядом с меткой!",
        body: "Вы находитесь рядом с сохранённой точкой.",
      },
      trigger: null
    });

    this.activeNotifications.set(marker.id, {
      markerId: marker.id,
      notificationId,
      timestamp: Date.now()
    });
  }

  async removeNotification(markerId: number): Promise<void> {
    const notification = this.activeNotifications.get(markerId);
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      this.activeNotifications.delete(markerId);
    }
  }
}
