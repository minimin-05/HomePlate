import { supabase } from './supabaseClient';

// ⚾ KBO 10개 구단 주요 주전 선수 명단 팩토리
const TEAM_PLAYERS = {
  "삼성": { P: ["원태인", "코너", "레예스", "이승현"], C: ["강민호"], "1B": ["디아즈"], "2B": ["류지혁"], "3B": ["김영웅"], SS: ["이재현"], LF: ["구자욱"], CF: ["김지찬"], RF: ["김현준"], LINEUP: ["김지찬", "이재현", "구자욱", "디아즈", "김영웅", "강민호", "이성규", "김헌곤", "윤정빈"] },
  "LG": { P: ["엔스", "임찬규", "최원태"], C: ["박동원"], "1B": ["오스틴"], "2B": ["신민재"], "3B": ["문보경"], SS: ["오지환"], LF: ["문성주"], CF: ["박해민"], RF: ["홍창기"], LINEUP: ["홍창기", "신민재", "김현수", "오스틴", "문보경", "박동원", "오지환", "박해민", "문성주"] },
  "기아": { P: ["네일", "양현종"], C: ["김태군"], "1B": ["이우성"], "2B": ["김선빈"], "3B": ["김도영"], SS: ["박찬호"], LF: ["소크라테스"], CF: ["최원준"], RF: ["나성범"], LINEUP: ["박찬호", "소크라테스", "김도영", "최형우", "나성범", "김선빈", "이우성", "김태군", "최원준"] },
  "두산": { P: ["곽빈", "발라조빅"], C: ["양의지"], "1B": ["양석환"], "2B": ["강승호"], "3B": ["허경민"], SS: ["박준영"], LF: ["김재환"], CF: ["정수빈"], RF: ["조수행"], LINEUP: ["정수빈", "허경민", "라모스", "양석환", "김재환", "양의지", "강승호", "박준영", "조수행"] },
  "한화": { P: ["류현진", "문동주"], C: ["최재훈"], "1B": ["채은성"], "2B": ["안치홍"], "3B": ["노시환"], SS: ["이도윤"], LF: ["페라자"], CF: ["문현빈"], RF: ["김태연"], LINEUP: ["최인호", "페라자", "노시환", "채은성", "안치홍", "김태연", "문현빈", "최재훈", "이도윤"] },
  "키움": { P: ["후라도", "헤이시"], C: ["김재현"], "1B": ["최주환"], "2B": ["김혜성"], "3B": ["송성문"], SS: ["이주형"], LF: ["도슨"], CF: ["이형종"], RF: ["장재영"], LINEUP: ["이주형", "도슨", "김혜성", "송성문", "최주환", "고영우", "김재현", "이형종", "장재영"] },
  "SSG": { P: ["김광현", "엘리아스"], C: ["이지영"], "1B": ["오태곤"], "2B": ["박지환"], "3B": ["최정"], SS: ["박성한"], LF: ["에레디아"], CF: ["최지훈"], RF: ["한유섬"], LINEUP: ["최지훈", "박성한", "에레디아", "최정", "한유섬", "이지영", "고명준", "박지환", "하재훈"] },
  "KT": { P: ["고영표", "쿠에바스"], C: ["장성우"], "1B": ["문상철"], "2B": ["오윤석"], "3B": ["황재균"], SS: ["심우준"], LF: ["로하스"], CF: ["배정대"], RF: ["김민혁"], LINEUP: ["로하스", "김민혁", "강백호", "장성우", "황재균", "문상철", "오윤석", "심우준", "배정대"] },
  "롯데": { P: ["반즈", "박세웅"], C: ["유강남"], "1B": ["나승엽"], "2B": ["고승민"], "3B": ["손호영"], SS: ["박승욱"], LF: ["황성빈"], CF: ["윤동희"], RF: ["레이예스"], LINEUP: ["황성빈", "윤동희", "고승민", "레이예스", "손호영", "나승엽", "전준우", "유강남", "박승욱"] },
  "NC": { P: ["카스타노", "신민혁"], C: ["김형준"], "1B": ["데이비슨"], "2B": ["박민우"], "3B": ["서호철"], SS: ["김주원"], LF: ["권희동"], CF: ["박건우"], RF: ["아두치"], LINEUP: ["박민우", "권희동", "박건우", "데이비슨", "김성욱", "서호철", "김형준", "김주원", "도태훈"] }
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 낱개 경기 단위 정밀 패키징 생성 함수
const generateSingleMatch = (t1, t2, date) => {
  const t1Score = Math.floor(Math.random() * 10) + 1;
  let t2Score = Math.floor(Math.random() * 10) + 1;
  while (t1Score === t2Score) t2Score = Math.floor(Math.random() * 10) + 1;

  const generateTeamDetails = (teamName) => {
    const pool = TEAM_PLAYERS[teamName];
    const positions = {
      P: getRandomElement(pool.P), C: pool.C[0], "1B": pool["1B"][0], "2B": pool["2B"][0],
      "3B": pool["3B"][0], SS: pool.SS[0], LF: pool.LF[0], CF: pool.CF[0], RF: pool.RF[0]
    };
    const lineup = [`P ${positions.P}`];
    pool.LINEUP.forEach((p, i) => lineup.push(`${i + 1} ${p}`));
    return { positions, lineup };
  };

  const t1Details = generateTeamDetails(t1);
  const t2Details = generateTeamDetails(t2);

  return {
    game_date: date,
    team1_name: t1,
    team2_name: t2,
    team1_score: t1Score,
    team2_score: t2Score,
    is_win: t1Score > t2Score,
    team1_positions: t1Details.positions,
    team2_positions: t2Details.positions,
    team1_lineup: t1Details.lineup,
    team2_lineup: t2Details.lineup
  };
};

export const gameDataService = {
  // 💡 동적 응원팀(userTeam) 인자를 수용하여 처리합니다.
  async checkDB(date, userTeam = "삼성") {
    try {
      const { data, error } = await supabase
        .from('game_records') 
        .select('*')
        .eq('game_date', date)
        .maybeSingle();

      // 1. DB에 해당 날짜의 경기 일정이 정상적으로 등록되어 있는 경우
      if (data && !error) {
        const allMatches = data.teams_data.matches || [];
        const targetMatch = allMatches.find(m => m.team1_name === userTeam || m.team2_name === userTeam);
        return targetMatch || allMatches[0]; 
      }

      // 2. 💡 [기획 수정] DB에 데이터가 없으면 임의로 자동 인서트하지 않고, "없다"고 판정하기 위해 과감하게 null 반환!
      console.log(`[안내] ${date} 자의 경기 기록이 DB에 등록되어 있지 않습니다.`);
      return null;

    } catch (err) {
      console.warn('스포츠 데이터 조회 중 예외 트래킹:', err.message);
      return null;
    }
  },

  /**
   * 🛠️ [추가] 관리자 패널 전용 5경기 수동 수집 및 강제 생성 메소드
   * 나중에 관리자 페이지 버튼 액션에서 gameDataService.generateAndSaveDailyMatches(date) 형태로 호출하면 돼!
   */
  async generateAndSaveDailyMatches(date) {
    try {
      let teams = Object.keys(TEAM_PLAYERS);
      for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
      }

      const matches = [];
      for (let k = 0; k < 5; k++) {
        const match = generateSingleMatch(teams[k * 2], teams[k * 2 + 1], date);
        matches.push(match);
      }

      const { error: insertError } = await supabase
        .from('game_records')
        .insert([{ game_date: date, teams_data: { matches } }]);

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error("관리자 데이터 생성 실패:", err.message);
      return false;
    }
  }
};