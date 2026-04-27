import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Schedule 3 random notifications between 9am-9pm each day
export async function scheduleDailyReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const messages = [
    { title: 'Pause for a moment', body: "What's one thing you're grateful for right now?" },
    { title: 'Gratitude check-in', body: 'Take 30 seconds to reflect on something good today.' },
    { title: 'You deserve this', body: 'Write one grateful thought and earn a reward.' },
  ];

  const START_HOUR = 9;
  const END_HOUR = 21;
  const slots = getRandomSlots(3, START_HOUR, END_HOUR);

  for (let i = 0; i < slots.length; i++) {
    const { hour, minute } = slots[i];
    const msg = messages[i % messages.length];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }
}

function getRandomSlots(count, startHour, endHour) {
  const totalMinutes = (endHour - startHour) * 60;
  const used = new Set();
  const slots = [];

  while (slots.length < count) {
    const offset = Math.floor(Math.random() * totalMinutes);
    if (!used.has(offset)) {
      used.add(offset);
      const totalMins = startHour * 60 + offset;
      slots.push({ hour: Math.floor(totalMins / 60), minute: totalMins % 60 });
    }
  }
  return slots;
}
