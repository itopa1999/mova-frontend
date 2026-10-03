export type ToastType = 'success' | 'error' | 'warning' | 'info'

export function showToast(type: ToastType, message: string): void {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { type, message },
    }),
  )
}

export function showErrorToast(message: string): void {
  showToast('error', message)
}

export function showSuccessToast(message: string): void {
  showToast('success', message)
}
