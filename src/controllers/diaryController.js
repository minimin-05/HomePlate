import { diaryService } from '../services/diaryService';
import { gameDataService } from '../services/gameDataService';

export const diaryController = {
  // 1. 일기 리스트 조회 (비동기 정석 처리)
  async fetchUserDiaries(setDiaries, setTotalCount) {
    try {
      const data = await diaryService.getDiaries(); 
      if (data) {
        setDiaries(data);
        setTotalCount(data.length);
      } else {
        setDiaries([]); setTotalCount(0);
      }
    } catch (error) {
      console.error('[컨트롤러] 일기 리스트 로드 중 예외 발생:', error.message);
      setDiaries([]); setTotalCount(0);
    }
  },


  async loadGameDataTemplate(date, userTeam, callback) {
    if (!date) {
      alert('날짜를 먼저 선택해주세요!');
      return;
    }

    const gameRecord = await gameDataService.checkDB(date, userTeam);
    
    if (gameRecord) {
      alert('경기 데이터를 성공적으로 불러왔습니다!');
      if (callback && typeof callback === 'function') {
        callback(gameRecord);
      }
    } else {
     
      console.log("[컨트롤러] DB에 데이터가 없으므로 뷰의 목업 시스템을 가동합니다.");
      if (callback && typeof callback === 'function') {
        callback(null); 
      }
    }
  },

  // 3. 일기 신규 저장 (CREATE)
  async handleSaveDiary(diaryData, photoFiles, onSuccess) {
    try {
      let photo_urls = [];
      if (photoFiles && photoFiles.length > 0) {
        photo_urls = await diaryService.uploadPhotos(photoFiles);
      }

      const saveSuccess = await diaryService.createDiary({
        date: diaryData.date,
        title: diaryData.title,
        content: diaryData.content,
        photo_urls: photo_urls, 
        game_data: diaryData.gameData 
      });

      if (saveSuccess) {
        alert('오늘의 경기 일기가 성공적으로 기록되었습니다!');
        if (onSuccess) await onSuccess(); 
      }
    } catch (error) {
      console.error('[컨트롤러] 최종 저장 실패:', error.message);
      alert(`저장 실패: ${error.message}`);
    }
  },

  // 4. 일기 수정 처리 (UPDATE)
  async handleUpdateDiary(diaryId, diaryData, photoFiles, onSuccess) {
    try {
      let photo_urls = [];
      if (photoFiles && photoFiles.length > 0) {
        photo_urls = await diaryService.uploadPhotos(photoFiles);
      }

      const updateSuccess = await diaryService.updateDiary(diaryId, {
        date: diaryData.date,
        title: diaryData.title,
        content: diaryData.content,
        photo_urls: photo_urls,
        existing_photo_url: diaryData.existing_photo_url,
        game_data: diaryData.gameData
      });

      if (updateSuccess) {
        alert('경기 일기가 성공적으로 수정되었습니다!');
        if (onSuccess) {
          await onSuccess(); 
        }
      }
    } catch (error) {
      console.error('[컨트롤러] 최종 수정 실패:', error.message);
      alert(`수정 실패: ${error.message}`);
    }
  },

  // 5. 일기 삭제 처리 (DELETE)
  async handleDeleteDiary(diaryId, onSuccess) {
    if (!window.confirm('정말로 이 직관 기록을 삭제하시겠습니까? 😭')) return;

    try {
      const deleteSuccess = await diaryService.deleteDiary(diaryId);
      
      if (deleteSuccess) {
        alert('직관 기록이 삭제되었습니다.');
        if (onSuccess) {
          await onSuccess(); 
        }
      } else {
        alert('DB 삭제에 실패했습니다. RLS 권한을 확인해보세요.');
      }
    } catch (error) {
      
      console.error('[컨트롤러] 최종 삭제 실패:', error.message);
      alert(`삭제 실패: ${error.message}`);
    }
  }
};