// components/DesktopNotification.tsx

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// ✅ Desktop notification (system tray/action center ke liye)
export const showDesktopNotification = (
  title: string,
  body: string,
  icon?: string,
  onClick?: () => void,
): void => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const uniqueTag = `customer-notif-${Date.now()}-${Math.random()}`;

    const notification = new Notification(title, {
      body: body,
      icon: icon || "/favicon.ico",
      silent: false,
      requireInteraction: true,
      tag: uniqueTag,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
  }
};

// Har 5 SECOND mein notification
let pollingInterval: NodeJS.Timeout | null = null;
let notificationCount = 0;
let totalNotificationsSent = 0;
let startTimeReference: number | null = null;

export const startRecurringNotifications = (
  getCustomerCreatedTime: () => Date | string | null,
  showInPageNotification: (title: string, body: string) => void, // ✅ In-page notification callback
) => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  notificationCount = 0;
  totalNotificationsSent = 0;
  startTimeReference = Date.now();


  const sendNotifications = (title: string, body: string) => {
    // 1. Desktop notification
    showDesktopNotification(title, body, "/favicon.ico", () => {
      window.dispatchEvent(new CustomEvent("navigateToLeadTable"));
    });

    // 2. In-page notification (screen pe dikhega)
    showInPageNotification(title, body);
  };

  // Pehla notification immediately
  sendNotifications(
    "✅ Customer Registered!",
    "New customer registered. Monitoring started for 10 minutes.",
  );
  notificationCount++;
  totalNotificationsSent++;

  pollingInterval = setInterval(() => {
    const currentTime = Date.now();
    const elapsedMinutes =
      (currentTime - (startTimeReference || currentTime)) / 1000 / 60;
    const customerCreatedAt = getCustomerCreatedTime();

    if (customerCreatedAt) {
      const createdAtTime = new Date(customerCreatedAt).getTime();
      const minutesSinceCreation = (currentTime - createdAtTime) / 1000 / 60;

      if (minutesSinceCreation > 10) {
       
        stopRecurringNotifications();
        return;
      }
    }

    if (elapsedMinutes <= 10) {
      const remainingMinutes = (10 - elapsedMinutes).toFixed(1);
      sendNotifications(
        "⏰ Customer Alert!",
        `Customer still needs attention! ${remainingMinutes} minutes remaining.`,
      );
      notificationCount++;
      totalNotificationsSent++;
    } else {
      stopRecurringNotifications();
    }
  }, 5000);
};

export const stopRecurringNotifications = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
 
  notificationCount = 0;
  totalNotificationsSent = 0;
  startTimeReference = null;
};
