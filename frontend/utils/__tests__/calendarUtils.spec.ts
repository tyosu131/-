import { generateCalendarDates } from '../calendarUtils';

describe('generateCalendarDates', () => {
  it('与えられた月と年に対して正しいカレンダーの日付を生成するべき', () => {
    const year = 2024;
    const month = 5; // 6月 (0から始まるインデックス)
    const dates = generateCalendarDates(year, month);

    expect(dates).toHaveLength(42); // 2024年6月はカレンダーに表示される日数（空のスロットを含む）が42日ある

    // 月の最初の日をチェック
    expect(dates[0]).toBeNull(); // 2024年5月26日は日曜日なので、最初の日は空
    expect(dates[6]).toEqual({ date: '2024-06-01' });

    // 月の最後の日をチェック
    expect(dates[41]).toBeNull(); // 2024年7月6日は土曜日なので、最後の日は空

    // 月の中間の日をチェック
    expect(dates[10]).toEqual({ date: '2024-06-05' });
  });

  it('週の始めに空のスロットを正しく生成するべき', () => {
    const year = 2024;
    const month = 1; // 2月 (0から始まるインデックス)
    const dates = generateCalendarDates(year, month);

    expect(dates).toHaveLength(42); // 2024年2月はカレンダーに表示される日数（空のスロットを含む）が42日ある

    // 月の最初の日をチェック
    expect(dates[0]).toBeNull(); // 2024年1月28日は日曜日なので、最初の日は空
    expect(dates[4]).toEqual({ date: '2024-02-01' });
  });

  it('週の終わりに空のスロットを正しく生成するべき', () => {
    const year = 2024;
    const month = 9; // 10月 (0から始まるインデックス)
    const dates = generateCalendarDates(year, month);

    expect(dates).toHaveLength(42); // 2024年10月はカレンダーに表示される日数（空のスロットを含む）が42日ある

    // 月の最後の日をチェック
    expect(dates[41]).toBeNull(); // 2024年11月3日は日曜日なので、最後の日は空
    expect(dates[32]).toEqual({ date: '2024-10-31' }); // 10月31日は正しい位置にある
  });
});
