import { userService } from '../services/userService';

// 1. 앞에 export를 확실하게 붙여서 선언해줘
export const userController = {
  // 회원가입 폼 제출 처리 (handleRegister)
  async handleRegister(id, pwd, pwdConfirm) {
    if (!id || !pwd) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return false;
    }
    if (!id.includes('@')) {
      alert('아이디를 올바른 이메일 형식(example@domain.com)으로 입력해주세요.');
      return false;
    }
    if (pwd !== pwdConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    const success = await userService.signUp(id, pwd);
    if (success) {
      alert('회원가입 성공! 가입하신 아이디로 로그인 해주세요.');
    } else {
      alert('회원가입에 실패했습니다. 이미 등록된 아이디인지 확인하세요.');
    }
    return success;
  },

  // 로그인 폼 제출 처리 (handleLoginSubmit)
  async handleLoginSubmit(id, pwd, onLoginSuccess) {
    if (!id || !pwd) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const success = await userService.login(id, pwd);
    if (success) {
      onLoginSuccess();
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  }
};