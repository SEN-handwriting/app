import dayjs from "dayjs";

export function formatTimeDuration(ms: dayjs.ConfigType) {
  return dayjs(ms).format("mm:ss.SSS");
}

export function formatDate(timestamp: dayjs.ConfigType) {
  return dayjs(timestamp).format("YYYY-MM-DD");
}
