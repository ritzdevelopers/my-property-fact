import Page from '../page';

const SHEET_NAMES_BY_NUMBER = {
  1: 'Google PPC',
  2: 'Google Pmax',
  3: 'Google YT',
  4: 'Taboola',
  5: 'HT',
  6: 'TOI',
  7: 'NDTV',
  8: 'moneycontrol',
};

export default async function InerPage({ params }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params;
  const number = parseInt(resolvedParams?.number, 10);
  const sheet_name = SHEET_NAMES_BY_NUMBER[number] ?? 'Google Display';

  return <Page sheet_name={sheet_name} />;
}
