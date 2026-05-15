export function formatDate(value) {
  if (!value) return '最近发布'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '最近发布'
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}.${month}.${day}`
}

export function formatDateTime(value) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  const datePart = formatDate(date)
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${datePart} ${hours}:${minutes}`
}

export function truncateText(value, maxLength = 88) {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}...`
}

export function formatExchangeStatus(status) {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return '待确认'
    case 'confirmed':
      return '待交接'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return '处理中'
  }
}

export function formatExchangeTone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}
