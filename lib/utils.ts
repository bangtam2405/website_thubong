import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateVN(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, '0')}/${
    (date.getMonth() + 1).toString().padStart(2, '0')
  }/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${
    date.getMinutes().toString().padStart(2, '0')
  }`;
}
