import { set } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

try {
  const currentStartTime = ""; // Empty string
  const [startH, startM] = currentStartTime.split(':').map(Number);
  console.log(startH, startM);
  const date = new Date();
  const startDateTime = set(date, { hours: startH, minutes: startM, seconds: 0 });
  console.log("startDateTime:", startDateTime);
  const startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
  console.log("Success:", startStr);
} catch (e) {
  console.log("Error:", e.message);
}
