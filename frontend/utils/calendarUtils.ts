export const generateCalendarDates = (year: number, month: number) => {
  const datesArray = [];
  const date = new Date(year, month, 1);
  const startDay = date.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 前月の空のスロットを追加
  for (let i = 0; i < startDay; i++) {
      datesArray.push(null);
  }

  // 今月の日付を追加
  for (let i = 1; i <= lastDate; i++) {
      datesArray.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  // 週の終わりに空のスロットを追加して42セルに調整
  while (datesArray.length % 7 !== 0) {
      datesArray.push(null);
  }

  // 6週間分の42セルになるように追加の空のスロットを追加
  while (datesArray.length < 42) {
      datesArray.push(null);
  }

  console.log(datesArray); // デバッグ用に追加
  return datesArray;
};
