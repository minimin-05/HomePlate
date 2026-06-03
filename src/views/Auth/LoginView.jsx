import { useState } from 'react';
import '../../assets/Login.css'; // 분리한 CSS 파일 불러오기
import { userController } from '../../controllers/userController';

export default function LoginView({ onLoginSuccess, onViewChange }) {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 💡 [추가] 비밀번호 보임/숨김 제어 상태 변수
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // UserController의 로그인 처리 함수 호출
    await userController.handleLoginSubmit(id, pwd, onLoginSuccess);
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* 루트 폴더의 images/에서 직접 이미지를 매핑 (설정형 방식 적용) */}
        <img src="/images/HomePlate.png" alt="Home Plate Logo" className="login-logo" />

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="login-input"
            disabled={isLoading}
          />

          {/* 💡 [구조 변경] 눈 모양 버튼 배치를 위해 컨테이너로 감싸기 */}
          <div className="password-input-container">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="비밀번호"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="login-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPwd(!showPwd)}
              disabled={isLoading}
              title={showPwd ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPwd ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 버튼 */}
        <div className="login-footer">
          <button 
            type="button"
            onClick={() => onViewChange('register')} 
            className="register-link-btn"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}