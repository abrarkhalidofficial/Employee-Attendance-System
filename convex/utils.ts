export async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pakistan Standard Time (PKT) is UTC+5
export function getPakistanTime() {
  const now = new Date();
  // Convert to Pakistan time (UTC+5)
  const pakistanTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
  return pakistanTime;
}

export function todayISO() {
  const pakistanTime = getPakistanTime();
  const year = pakistanTime.getFullYear();
  const month = String(pakistanTime.getMonth() + 1).padStart(2, "0");
  const day = String(pakistanTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentPakistanTime() {
  const pakistanTime = getPakistanTime();
  const hours = String(pakistanTime.getHours()).padStart(2, "0");
  const minutes = String(pakistanTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
