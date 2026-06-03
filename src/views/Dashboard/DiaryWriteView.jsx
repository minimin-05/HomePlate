import { useState, useEffect } from 'react';
import '../../assets/DiaryWrite.css';
import { diaryController } from '../../controllers/diaryController';

export default function DiaryWriteView({ isOpen, onClose, onRefresh, editData }) {
  const [date, setDate] = useState(editData?.date || '');
  const [mvp, setMvp] = useState(editData?.game_data?.mvp || '');
  const [content, setContent] = useState(editData?.content || '');
  
  const [photos, setPhotos] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState(editData?.photo_url ? [editData.photo_url] : []); 

  const [gameData, setGameData] = useState(editData?.game_data || null);
  const [myTeam, setMyTeam] = useState(editData?.game_data?.myTeam || 'team1');
  
  // 사용자가 드롭다운에서 선택한 구단 이름을 담을 상태 변수 (기본값: 삼성)
  const [myTeamName, setMyTeamName] = useState('삼성');

  useEffect(() => {
    if (editData?.game_data) {
      const savedTeamName = editData.game_data.myTeam === 'team1' 
        ? editData.game_data.team1_name 
        : editData.game_data.team2_name;
      
      if (savedTeamName) {
        const timer = setTimeout(() => {
          setMyTeamName(savedTeamName);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [editData]);

  if (!isOpen) return null;

  // ⚾ 경기 기록 불러오기 핸들러
  const handleLoadGame = async () => {
    if (!date) {
      alert('날짜를 먼저 선택해 주세요!');
      return;
    }

    await diaryController.loadGameDataTemplate(date, myTeamName, (data) => {
      if (data && Object.keys(data).length > 0) {
        setGameData(data);
        if (data.team2_name === myTeamName) {
          setMyTeam('team2');
        } else {
          setMyTeam('team1');
        }
      } else {
        alert(`등록된 경기 정보가 없습니다.\n원하는 팀명과 라인업을 직접 입력하여 일기를 작성하실 수 있습니다!`);
        
        setGameData({
          team1_name: myTeamName,
          team2_name: '상대팀',
          team1_score: 0,
          team2_score: 0,
          team1_positions: { P: '', C: '', '1B': '', '2B': '', '3B': '', SS: '', LF: '', CF: '', RF: '' },
          team2_positions: { P: '', C: '', '1B': '', '2B': '', '3B': '', SS: '', LF: '', CF: '', RF: '' },
          team1_lineup: ['P ', '1 ', '2 ', '3 ', '4 ', '5 ', '6 ', '7 ', '8 ', '9 '],
          team2_lineup: ['P ', '1 ', '2 ', '3 ', '4 ', '5 ', '6 ', '7 ', '8 ', '9 ']
        });
        setMyTeam('team1');
      }
    });
  };

  // 스코어보드 입력창 전용 실시간 상태 변경 핸들러
  const handleScoreBoardChange = (key, value) => {
    setGameData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: value
      };
    });
  };

  const handlePositionChange = (posKey, newValue) => {
    setGameData(prev => {
      const targetPositionsKey = myTeam === 'team1' ? 'team1_positions' : 'team2_positions';
      return {
        ...prev,
        [targetPositionsKey]: { ...prev[targetPositionsKey], [posKey]: newValue }
      };
    });
  };

  const handleLineupChange = (teamKey, index, newValue) => {
    setGameData(prev => {
      const targetLineupKey = teamKey === 'team1' ? 'team1_lineup' : 'team2_lineup';
      const updatedLineup = [...prev[targetLineupKey]];
      const prefix = updatedLineup[index].match(/^(P|\d)\s/) ? updatedLineup[index].match(/^(P|\d)\s/)[0] : '';
      updatedLineup[index] = `${prefix}${newValue}`;
      return { ...prev, [targetLineupKey]: updatedLineup };
    });
  };

  const currentDefense = gameData 
    ? (myTeam === 'team1' ? gameData.team1_positions : gameData.team2_positions)
    : null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFilesCount = photos.length + selectedFiles.length;

      if (totalFilesCount > 3) {
        alert('직관 사진은 최대 3장까지만 업로드할 수 있습니다!');
        return;
      }

      const newPhotos = [...photos, ...selectedFiles];
      const newUrls = [...previewUrls, ...selectedFiles.map(file => URL.createObjectURL(file))];

      setPhotos(newPhotos);
      setPreviewUrls(newUrls);
    }
  };

  const handleRemovePhoto = (index) => {
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);

    if (photos.length > 0) {
      const isNewFile = index >= (previewUrls.length - photos.length);
      if (isNewFile) {
        const fileIndex = index - (previewUrls.length - photos.length);
        const updatedPhotos = photos.filter((_, i) => i !== fileIndex);
        setPhotos(updatedPhotos);
      }
    }
  };

  const handleDeleteAction = async () => {
    if (editData?.id) {
      await diaryController.handleDeleteDiary(editData.id, async () => {
        await onRefresh(); 
        onClose();          
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isWin = gameData ? (Number(gameData.team1_score) > Number(gameData.team2_score)) : false;

    const finalGameData = {
      ...gameData,
      myTeam,
      mvp,
      isWin,
      is_win: isWin
    };

    const hasExistingPhoto = previewUrls[0] && previewUrls[0].startsWith('http');

    const diaryData = {
      date,
      title: gameData ? `[직관] ${gameData.team1_name} vs ${gameData.team2_name}` : '야구 일기',
      content,
      existing_photo_url: hasExistingPhoto ? previewUrls[0] : '', 
      gameData: finalGameData
    };

    if (editData?.id) {
      await diaryController.handleUpdateDiary(editData.id, diaryData, photos, () => {
        onRefresh(); onClose();
      });
    } else {
      await diaryController.handleSaveDiary(diaryData, photos, () => {
        onRefresh(); onClose();
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-x" onClick={onClose}>&times;</button>
        <div className="score-board-wrapper">
          <div className="team-score-box">
            
            {/* 홈팀 영역 */}
            <div className="board-team-cell">
              {gameData ? (
                <input 
                  type="text"
                  value={gameData.team1_name || ''}
                  onChange={(e) => handleScoreBoardChange('team1_name', e.target.value)}
                  className="board-team-input text-right"
                  placeholder="팀 1"
                />
              ) : (
                <span className="team-label">TEAM 1</span>
              )}

              {gameData ? (
                <input 
                  type="number"
                  value={gameData.team1_score ?? 0}
                  onChange={(e) => handleScoreBoardChange('team1_score', e.target.value)}
                  className="board-score-input"
                  min="0"
                />
              ) : (
                <span className="team-score-num">-</span>
              )}
            </div>

            <div className="score-divider">:</div>

            {/* 원정팀 영역 */}
            <div className="board-team-cell">
              {gameData ? (
                <input 
                  type="number"
                  value={gameData.team2_score ?? 0}
                  onChange={(e) => handleScoreBoardChange('team2_score', e.target.value)}
                  className="board-score-input"
                  min="0"
                />
              ) : (
                <span className="team-score-num">-</span>
              )}

              {gameData ? (
                <input 
                  type="text"
                  value={gameData.team2_name || ''}
                  onChange={(e) => handleScoreBoardChange('team2_name', e.target.value)}
                  className="board-team-input text-left"
                  placeholder="팀 2"
                />
              ) : (
                <span className="team-label">TEAM 2</span>
              )}
            </div>

          </div>
        </div>

        <div className="date-control-bar">
          <div className="date-input-wrapper">
            <span className="calendar-icon">📅</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="write-date-input" />
            <span className="date-suffix-text">경기 일지</span>
          </div>

          <div className="my-team-name-selector" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>구단 선택:</span>
            <select 
              value={myTeamName} 
              onChange={(e) => setMyTeamName(e.target.value)} 
              className="team-select-dropdown"
            >
              <option value="삼성">삼성</option>
              <option value="LG">LG</option>
              <option value="기아">기아</option>
              <option value="두산">두산</option>
              <option value="한화">한화</option>
              <option value="키움">키움</option>
              <option value="SSG">SSG</option>
              <option value="KT">KT</option>
              <option value="롯데">롯데</option>
              <option value="NC">NC</option>
            </select>
          </div>

          {gameData && (
            <div className="my-team-selector">
              <label style={{color: '#111827'}}>수비 관점: </label>
              <select value={myTeam} onChange={(e) => setMyTeam(e.target.value)} className="team-select-dropdown">
                <option value="team1">{gameData.team1_name}</option>
                <option value="team2">{gameData.team2_name}</option>
              </select>
            </div>
          )}

          <button type="button" onClick={handleLoadGame} className="game-fetch-btn">
            🔄 경기 기록 불러오기
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-main-form">
          <div className="middle-layout-grid">
            <div className="field-section">
              <div className="section-title-left"><span className="icon">💎</span> 수비위치 ({gameData ? (myTeam === 'team1' ? gameData.team1_name : gameData.team2_name) : '선택팀'} 수비)</div>
              <div className="green-field-box">
                <div className="baseball-ground-vector">
                  {currentDefense && (
                    <>
                      {Object.keys(currentDefense).map((posKey) => (
                        <div key={posKey} className={`player-marker pos-${posKey.toLowerCase()}`}>
                          <span className="pos-label">{posKey}</span>
                          <input 
                            type="text" 
                            value={currentDefense[posKey] || ''} 
                            onChange={(e) => handlePositionChange(posKey, e.target.value)}
                            className="inline-edit-player-input"
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {!currentDefense && <div className="field-placeholder-text">경기를 불러오면 수비 배치가 표시됩니다.</div>}
                </div>
              </div>
            </div>

            <div className="lineup-section">
              <div className="section-title-left"><span className="icon">📋</span> 라인업</div>
              <div className="lineup-tables-container">
                <div className="team-lineup-table">
                  <div className="table-team-header">{gameData ? gameData.team1_name : 'TEAM 1'}</div>
                  <div className="lineup-rows">
                    {gameData?.team1_lineup?.map((player, idx) => (
                      <div key={idx} className="lineup-row-item">
                        <span className="position-num-badge">{idx === 0 ? 'P' : idx}</span>
                        <input 
                          type="text" 
                          value={player.replace(/^P\s|^\d\s/, '')} 
                          onChange={(e) => handleLineupChange('team1', idx, e.target.value)}
                          className="inline-edit-lineup-input"
                        />
                      </div>
                    )) || Array(10).fill(null).map((_, idx) => (
                      <div key={idx} className="lineup-row-item">
                        <span className="position-num-badge">{idx === 0 ? 'P' : idx}</span>
                        <span className="player-name-text">선수 정보 없음</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="team-lineup-table">
                  <div className="table-team-header">{gameData ? gameData.team2_name : 'TEAM 2'}</div>
                  <div className="lineup-rows">
                    {gameData?.team2_lineup?.map((player, idx) => (
                      <div key={idx} className="lineup-row-item">
                        <span className="position-num-badge-t2">{idx === 0 ? 'P' : idx}</span>
                        <input 
                          type="text" 
                          value={player.replace(/^P\s|^\d\s/, '')} 
                          onChange={(e) => handleLineupChange('team2', idx, e.target.value)}
                          className="inline-edit-lineup-input"
                        />
                      </div>
                    )) || Array(10).fill(null).map((_, idx) => (
                      <div key={idx} className="lineup-row-item">
                        <span className="position-num-badge-t2">{idx === 0 ? 'P' : idx}</span>
                        <span className="player-name-text">선수 정보 없음</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="form-divider-line" />

          <div className="bottom-layout-grid">
            <div className="bottom-left-column">
              <div className="form-input-group">
                <div className="section-title-left"><span className="icon">✪</span> MVP</div>
                <input type="text" placeholder="MVP 선수의 이름을 입력하세요" value={mvp} onChange={(e) => setMvp(e.target.value)} className="mvp-text-input" />
                <p className="input-guide-sub">오늘의 가장 빛나는 선수를 기록하세요.</p>
              </div>

              <div className="form-input-group">
                <div className="section-title-left"><span className="icon">📷</span> 사진 첨부 ({previewUrls.length}/3)</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {previewUrls.map((url, index) => (
                    <div key={index} className="photo-upload-dashed-box" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                      <img src={url} alt={`미리보기 ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => handleRemovePhoto(index)} className="photo-delete-badge-btn">&times;</button>
                    </div>
                  ))}
                  {previewUrls.length < 3 && (
                    <label className="photo-upload-dashed-box">
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{display: 'none'}} multiple />
                      <span className="plus-icon-lg">+</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bottom-right-column">
              <div className="section-title-left"><span className="icon">📝</span> 메모</div>
              <textarea placeholder="오늘 경기의 중요한 순간들을 기록해보세요..." value={content} onChange={(e) => setContent(e.target.value)} className="memo-textarea-box" />
            </div>
          </div>

          <div className="submit-action-row" style={{ display: 'flex', justifyContent: editData ? 'space-between' : 'flex-end', width: '100%' }}>
            {editData && (
              <button type="button" onClick={handleDeleteAction} className="final-diary-delete-btn">
                🗑️ 기록 삭제하기
              </button>
            )}
            <button type="submit" className="final-diary-save-btn">
              {editData ? '기록 수정하기' : '일기장 저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}