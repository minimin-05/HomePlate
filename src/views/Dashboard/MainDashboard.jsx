import { useState, useEffect } from 'react';
import '../../assets/Dashboard.css'; 
import { diaryController } from '../../controllers/diaryController';
import DiaryWriteView from './DiaryWriteView';
import AdminView from './AdminView'; 
import { supabase } from '../../services/supabaseClient'; 

export default function MainDashboard({ onLogout }) {
  const [diaries, setDiaries] = useState([]);
  const [totalCount, setTotalCount] = useState(0); 
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isAdminOpen, setIsAdminOpen] = useState(false); 

// profiles 테이블의 실시간 데이터를 조회
const checkUser = async () => {
  // 1. 현재 로그인한 유저의 기본 auth 정보(id)를 가져옵니다.
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return; // 로그인 세션이 없으면 튕겨내기

  try {
    // 데이터베이스의 public.profiles 테이블 조회
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(); // 데이터 1줄만 쏙 뽑아오기

    if (error) throw error;

    console.log("🔥 현재 로그인한 유저의 진짜 역할:", profileData?.role); 

    // 3. 역할이 정확히 admin인지 판별해서 마스터 키 부여!
    if (profileData?.role === 'admin') {
      setIsAdmin(true); 
    } else {
      setIsAdmin(false);
    }
  } catch (err) {
    console.error("사용자 권한 확인 실패:", err.message);
  }
};

  // 일기 리스트 및 전체 개수 동기화 로드 함수
  const loadData = async () => {
    await diaryController.fetchUserDiaries(
      (data) => setDiaries([...data]),
      setTotalCount 
    );
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
      checkUser();
    }, 0);

    return () => clearTimeout(timer); 
  }, []);

  const handleCardClick = (diary) => {
    setSelectedDiary(diary);
    setIsWriteOpen(true);
  };

  const handleOpenNewWrite = () => {
    setSelectedDiary(null); 
    setIsWriteOpen(true);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-flex">
        <h1 className="dashboard-header-title">HOME PLATE</h1>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdminOpen(true)} 
            className="admin-panel-trigger-btn"
          >
            ⚙️ 관리자 패널
          </button>
        )}
      </header>

      <main className="dashboard-main">
        <div className="dashboard-sub-header">
          <div className="sub-title-area">
            <h2>나의 야구 일기장</h2>
          </div>
          <div className="record-badge">
            총 {totalCount}개의 경기 기록
          </div>
        </div>

        <div className="diary-grid">
          {diaries && diaries.map((diary) => {
            const isMatchWin = diary.game_data?.isWin || diary.game_data?.is_win || false;
            const t1Score = diary.game_data?.team1_score ?? '-';
            const t2Score = diary.game_data?.team2_score ?? '-';
            const cardThumbnail = diary.photo_url ? diary.photo_url : '/images/sport.png';

            return (
              <div key={diary.id} className="diary-card" onClick={() => handleCardClick(diary)} style={{ cursor: 'pointer' }}>
                <div className="card-img-wrapper">
                  <img 
                    src={cardThumbnail} 
                    alt="경기 인증 사진" 
                    className="card-img" 
                    onError={(e) => { e.target.src = '/images/sport.png'; }}
                  />
                </div>
                <div className="card-content">
                  <div className="card-meta">
                    <span>{diary.date || '날짜 미지정'}</span>
                    <span className={`score-tag ${isMatchWin ? 'win' : 'lose'}`}>
                      {isMatchWin ? `승 ${t1Score}-${t2Score}` : `패 ${t1Score}-${t2Score}`}
                    </span>
                  </div>
                  <h3 className="card-title">{diary.title || '야구 직관 일기'}</h3>
                  <p className="card-snippet">{diary.content || '작성된 내용이 없습니다.'}</p>
                </div>
              </div>
            );
          })}

          <div className="diary-card-empty" onClick={handleOpenNewWrite}>
            <span className="empty-icon">📸</span>
            <strong className="empty-title">새로운 추억 추가</strong>
            <span className="empty-desc">오늘의 경기를 기록해보세요</span>
          </div>
        </div>
      </main>

      <button className="floating-add-btn" onClick={handleOpenNewWrite}>+</button>

      <DiaryWriteView 
        key={selectedDiary?.id || 'new_diary'} 
        isOpen={isWriteOpen} 
        onClose={() => { 
          setIsWriteOpen(false); 
          setSelectedDiary(null); 
        }} 
        onRefresh={loadData}
        editData={selectedDiary} 
      />

      <AdminView isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
          <span onClick={onLogout} className="footer-logout-btn">Logout</span>
        </div>
      </footer>
    </div>
  );
}