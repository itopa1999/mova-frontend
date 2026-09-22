const DEVICE_ID_KEY = 'mova_device_id'

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getDeviceName(): string {
  // Best-effort human-readable name
  const ua = navigator.userAgent
  const platform = navigator.platform || 'Unknown'
  return `${platform} · ${ua.slice(0, 80)}`
}