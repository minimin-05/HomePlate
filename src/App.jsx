import { useState, useEffect } from 'react';
import LoginView from './views/Auth/LoginView';
import RegisterView from './views/Auth/RegisterView';
import { userService } from './services/userService';
import MainDashboard from './views/Dashboard/MainDashboard';

export default function App() {
  // view: 'login' | 'register' | 'dashboard' 화면 상태 제어
  const [view, setView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 앱이 처음 켜질 때 로그인된 세션이 있는지 확인 (설계 문서 checkSession 반영)
  useEffect(() => {
    async function initAuth() {
      const loggedIn = await userService.checkSession();
      if (loggedIn) {
        setIsAuthenticated(true);
        setView('dashboard');
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  // 로그인 성공 시 호출될 핸들러
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  // 로그아웃 버튼 클릭 시 호출될 핸들러
  const handleLogout = async () => {
    await userService.signOut();
    setIsAuthenticated(false);
    setView('login');
  };

  // 로딩 중일 때 보여줄 화면
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FDFBF0' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  // 상태(view)에 따른 화면 라우팅 조건문
  return (
  <>
    {view === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} onViewChange={setView} />}
    {view === 'register' && <RegisterView onViewChange={setView} />}
    
    {/* 임시 웰컴 레이아웃을 걷어내고 완성된 메인 대시보드로 정식 연결 */}
    {view === 'dashboard' && isAuthenticated && (
      <MainDashboard onLogout={handleLogout} />
    )}
  </>
);
}