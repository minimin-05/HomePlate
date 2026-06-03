import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { gameDataService } from '../../services/gameDataService';
import '../../assets/AdminView.css';

export default function AdminView({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  // 유저 목록 로드 함수
  const loadAllUsers = async () => {
    const data = await userService.getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    if (isOpen) {
      (async () => {
        await loadAllUsers();
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. 유저 삭제 및 차단 처리
  const handleKickUser = async (userId, email) => {
    if (!window.confirm(`[경고] 정말로 ${email} 사용자를 영구 삭제/차단하시겠습니까?`)) return;
    
    const success = await userService.deleteUserByAdmin(userId);
    if (success) {
      alert('해당 사용자가 차단 및 삭제되었습니다.');
      await loadAllUsers(); 
    } else {
      alert('권한이 없거나 삭제에 실패했습니다.');
    }
  };

  // 2. 외부 스포츠 API 데이터를 가져와 DB에 저장
  const handleFetchAndSaveSportsAPI = async () => {
  try {
    // 💡 checkDB(단순 조회) 대신, 실시간 수동 생성/인서트 엔진 메소드를 호출하도록 정밀 수리!
    const success = await gameDataService.generateAndSaveDailyMatches(targetDate);
    
    if (success) {
      alert(`[API 성공] ${targetDate} KBO 경기 데이터 5경기 원격 수집 및 데이터베이스(game_records) 동기화 완료!`);
    } else {
      alert('해당 날짜의 경기 데이터를 생성하지 못했거나 이미 등록되어 있습니다.');
    }
  } catch (error) {
    alert('스포츠 API 로드 실패: ' + error.message);
  }
};

  return (
    <div className="modal-overlay">
      <div className="admin-modal-container">
        
        {/* 모달 상단 타이틀 구역 */}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">관리</h2>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>
        <hr style={{ margin: '0 0 25px 0', borderColor: '#eaeaea' }} />

        {/* 📡 섹션 1: 외부 API 수집 카드 */}
        <div className="admin-card-section">
          <h3 className="admin-section-title">
            <span>📡</span> 외부 스포츠 API 데이터 수집 관리
          </h3>
          <p className="admin-section-desc">
            특정 날짜의 KBO 경기 일정 및 선발 라인업을 수집하여 <code className="admin-code-badge">game_records</code> 테이블에 동기화합니다.
          </p>
          <div className="admin-api-form">
            <input 
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)} 
              className="admin-date-input"
            />
            <button onClick={handleFetchAndSaveSportsAPI} className="admin-api-btn">
              🔄 당일 경기 정보 수집 및 저장
            </button>
          </div>
        </div>

        {/* 👥 섹션 2: 회원 리스트 */}
        <div className="admin-card-section user-list-section">
          <h3 className="admin-section-title">
            <span>👥</span> 서비스 가입 사용자 관리 <span style={{ color: '#007bff', fontWeight: 'bold' }}>({users.length}명)</span>
          </h3>
          
          <div className="admin-table-wrapper">
            <table className="admin-user-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th">사용자 ID (UUID)</th>
                  <th className="admin-table-th">이메일 계정</th>
                  <th className="admin-table-th">권한</th>
                  <th className="admin-table-th text-right">관리 조치</th>
                </tr>
              </thead>
              <tbody className="admin-table-tbody">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admin-empty-text">가입된 일반 사용자가 없습니다.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="admin-td-uuid">{u.id}</td>
                      <td className="admin-td-email">{u.email}</td>
                      <td className="admin-td-role">
                        <span className={`admin-role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-td-action">
                        {u.role !== 'admin' ? (
                          <button 
                            onClick={() => handleKickUser(u.id, u.email)} 
                            className="admin-kick-btn"
                          >
                            🚫 차단/삭제
                          </button>
                        ) : (
                          <span className="admin-protected-text">보호됨</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}