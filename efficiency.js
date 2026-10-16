const date = new Date()

const _date = {
  'day': date.getDate() < 10 ? `0${date.getDate()}` : date.getDate(),
  'month': date.getMonth() < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1,
  'year': date.getFullYear()
}