import { supabase } from './supabaseClient';

export const diaryService = {
  // 1. 로그인한 유저 본인의 일기만 가져오기
  async getDiaries() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("로그인된 사용자를 찾을 수 없습니다.");
      }

      // user_id가 매칭되는 일기만 로드
      const { data, error } = await supabase
        .from('diaries') 
        .select('*')
        .eq('user_id', user.id) 
        .order('date', { ascending: false }); 

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error("[서비스] 일기 로드 실패:", error.message);
      return null;
    }
  },

  // 2. 일기 저장 시 user_id 컬럼을 무조건 강제로 꽂아넣기 (CREATE)
  async createDiary(diaryData) {
    try {
     
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("유저 인증 세션이 만료되었습니다.");

      console.log("🚀 [인서트 시스템] 현재 작성자의 실제 UID 주입 실행:", user.id);

      const { data, error } = await supabase
        .from('diaries')
        .insert([
          {
            user_id: user.id,
            date: diaryData.date,
            title: diaryData.title,
            content: diaryData.content,
            game_data: diaryData.game_data || null, 
            photo_url: diaryData.photo_urls && diaryData.photo_urls.length > 0 ? diaryData.photo_urls[0] : ''
          }
        ])
        .select();

      if (error) {
        console.error("Supabase DB 실제 인서트 에러 상세:", error);
        throw error;
      }
      
      console.log("DB 저장 성공 완료 데이터:", data);
      return true;
    } catch (error) {
      console.error("[서비스] 일기 저장 실패:", error.message);
      throw error;
    }
  },

  // 3. 일기 수정 처리 (UPDATE)
  async updateDiary(diaryId, diaryData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("유저 인증 세션이 만료되었습니다.");

      let finalPhotoUrl = diaryData.existing_photo_url;
      if (diaryData.photo_urls && diaryData.photo_urls.length > 0) {
        finalPhotoUrl = diaryData.photo_urls[0];
      }

      const { error } = await supabase
        .from('diaries')
        .update({
          date: diaryData.date,
          title: diaryData.title,
          content: diaryData.content,
          game_data: diaryData.game_data || null,
          photo_url: finalPhotoUrl
        })
        .eq('id', diaryId)
        .eq('user_id', user.id); // 내 일기만 수정 가능하도록 인터락

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[서비스] 일기 수정 실패:", error.message);
      throw error;
    }
  },

  // 4. 일기 삭제 처리 (DELETE)
  async deleteDiary(diaryId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("유저 인증 세션이 만료되었습니다.");

      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', diaryId)
        .eq('user_id', user.id); // 내 일기만 삭제 가능하도록 잠금

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[서비스] 일기 삭제 실패:", error.message);
      return false;
    }
  },

  // 5. 직관 인증 사진 버킷 업로드 로직
  async uploadPhotos(files) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uploadedUrls = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `diary_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('homeplate_bucket') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('homeplate_bucket')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("[services/diaryService] 사진 업로드 실패:", error.message);
      throw error;
    }
  }
};