import { supabase } from './supabaseClient'; // SupabaseManager

export const userService = {
  
  //  전체 사용자 리스트
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('전체 유저 로드 실패:', error.message);
      return [];
    }
    return data;
  },

  // [관리자 전용] 사용자 삭제
  async deleteUserByAdmin(userId) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('유저 삭제 실패:', error.message);
      return false;
    }
    return true;
  },
  
  
  // 1. 회원가입 (signUp)
  async signUp(id, pwd) {
    // 사용자가 입력한 id를 그대로 Supabase의 email 필드에 넣어서 가입
    const { data, error } = await supabase.auth.signUp({
      email: id, 
      password: pwd,
    });

    if (error) {
      console.error('회원가입 실패:', error.message);
      return false;
    }
    return data.user !== null;
  },

  // 2. 로그인 (login)
  async login(id, pwd) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: id, 
      password: pwd,
    });

    console.log("★ [서비스] 서버로 보내는 ID:", id);
    console.log("★ [서비스] 서버로 보내는 PWD:", pwd);

    if (error) {
      console.error('로그인 실패:', error.message);
      return false;
    }
    return data.session !== null;
  },

  // 3. 로그아웃 (signOut)
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 실패:', error.message);
    }
  },

  // 4. 세션 체크
  async checkSession() {
    try {
      // 0.5초 이상 응답이 없으면 강제로 타임아웃 처리하여 탈출하는 안전장치
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 500)
      );

      // 둘 중 먼저 끝나는 쪽을 채택
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      return session !== null;
    } catch (error) {
      console.warn('세션 확인 지연 또는 만료 (로그인 창으로 이동):', error.message);
      return false; // 에러가 나거나 타임아웃되면 즉시 false를 던져서 로그인창이 뜨게 만듦
    }
  }
};