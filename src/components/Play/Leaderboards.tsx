import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import axios, { CancelTokenSource } from 'axios';
import Config from '../../Config';
import Countdown from '../../components/Uncategorized/Countdown';
import LeaderboardPlayerMatch, { PlayerMatchExtendedData } from '../../components/Leaderboard/LeaderboardPlayerMatch';

const Leaderboards = () => {
  const axiosCancelSource = useRef<CancelTokenSource | null>(null);
  const { t } = useTranslation();

  const [leaderboardsLoaded, setLeaderboardsLoaded] = useState(false);
  const [leaderboardsData, setLeaderboardsData] = useState<PlayerMatchExtendedData[]>([]);

  const getResults = useCallback(() => {
    axios
      .get(`${Config.apiUrl}/leaderboards/recent`, {
        withCredentials: true,
        cancelToken: axiosCancelSource.current?.token,
      })
      .then((response) => {
        setLeaderboardsData(response.data.slice(0, 15));
        setLeaderboardsLoaded(true);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    axiosCancelSource.current = axios.CancelToken.source();
    getResults();
    return () => axiosCancelSource.current?.cancel();
  }, [getResults]);

  return (
    <>
      {leaderboardsLoaded && leaderboardsData.length !== 0 && (
        <>
          <div className="flex justify-between">
            <div className="h1 mb-6">{t('page.home.matches_high')}</div>
            <Countdown minuteSeconds={60} onCountdownFinish={getResults} />
          </div>
          <LeaderboardPlayerMatch data={leaderboardsData} playerData={[]} skip={0} disableTrophy />
        </>
      )}
    </>
  );
};

export default Leaderboards;
