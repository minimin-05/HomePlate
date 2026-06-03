import { useState } from 'react';
import '../../assets/Register.css';
import { userController } from '../../controllers/userController';

export default function RegisterView({ onViewChange }) {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 패스워드 및 확인창 각각의 개별 표시 상태 변수
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // UserController의 회원가입 처리 함수 호출
    const success = await userController.handleRegister(id, pwd, pwdConfirm);
    
    setIsLoading(false);

    // 가입 성공 시 로그인 화면으로 전환
    if (success) {
      onViewChange('login');
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <h1 className="register-title">회원가입</h1>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="아이디 (이메일 주소)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="register-input"
            disabled={isLoading}
          />

          {/*  비밀번호 입력 섹션 */}
          <div className="register-password-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="비밀번호"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="register-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="register-password-toggle"
              onClick={() => setShowPwd(!showPwd)}
              disabled={isLoading}
            >
              {showPwd ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          {/* 비밀번호 확인 입력 섹션 */}
          <div className="register-password-wrapper">
            <input
              type={showPwdConfirm ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              className="register-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="register-password-toggle"
              onClick={() => setShowPwdConfirm(!showPwdConfirm)}
              disabled={isLoading}
            >
              {showPwdConfirm ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <button type="submit" className="register-submit-btn" disabled={isLoading}>
            {isLoading ? '가입 처리 중...' : '가입하기'}
          </button>
        </form>

        {/* 로그인 화면으로 돌아가기 버튼 */}
        <div className="register-footer">
          <button 
            type="button"
            onClick={() => onViewChange('login')} 
            className="back-link-btn"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}