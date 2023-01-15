import RelativeTime from '@yaireo/relative-time'

let format = new RelativeTime();

export function formatTime(time: string): string {
  let date = new Date(Date.parse(time));
  return format.from(date);
}