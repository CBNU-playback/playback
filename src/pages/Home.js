import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Modal,
  TextField,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  CloudUpload,
  Save,
  Add,
  Delete,
  Person,
  CheckCircle,
  RadioButtonUnchecked,
  TextFields,
  Slideshow,
  Help as HelpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import HelpModal from '../components/HelpModal';


const CustomSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-rail': {
    backgroundColor: '#e5e7eb',
    height: 6,
    borderRadius: 0,
  },
  '& .MuiSlider-track': {
    backgroundColor: '#111827',
    height: 6,
    borderRadius: 0,
  },
  '& .MuiSlider-thumb': {
    width: 6,
    height: 20,
    borderRadius: 0,
    backgroundColor: '#111827',
  },
}));

const HighlightMarks = ({ highlights, duration }) => {
  if (!highlights || !duration) return [];

  return highlights.map((highlight) => ({
    value: highlight.start,
    label: '',
    style: {
      backgroundColor: '#1976D2',
      width: `${((highlight.end - highlight.start) / duration) * 100}%`,
      height: '8px',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1,
      opacity: 0.7,
      borderRadius: '0px',
    },
  }));
};

// 모달 스타일
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// 이벤트별 색상 매핑
const EVENT_COLORS = {
  corner: '#ff9800',        // 오렌지
  foul: '#8e24aa',          // 보라
  freekick: '#00bcd4',      // 청록
  goal: '#e53935',          // 빨강
  'penalty kick': '#ffd600',// 노랑
  offside: '#607d8b',       // 회색
  save: '#43a047',          // 초록
  shoot: '#1976d2',         // 파랑
  custom: '#808080'
};

export default function FootballVideoEditor() {
  const location = useLocation();
  const { videoSrc, fileId, aiHighlights, highlights, customHighlights: loadedCustomHighlights, deletedHighlightIds: loadedDeletedIds } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // videoDuration을 상태로 설정
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [volume, setVolume] = useState(1); // 음량 상태 추가
  const [open, setOpen] = useState(false);
  const [customStartHour, setCustomStartHour] = useState('');
  const [customStartMinute, setCustomStartMinute] = useState('');
  const [customStartSecond, setCustomStartSecond] = useState('');
  const [customEndHour, setCustomEndHour] = useState('');
  const [customEndMinute, setCustomEndMinute] = useState('');
  const [customEndSecond, setCustomEndSecond] = useState('');
  const [customHighlights, setCustomHighlights] = useState(loadedCustomHighlights || []);
  const [customName, setCustomName] = useState(''); // 이름 상태 추가
  const [activeHighlightEnd, setActiveHighlightEnd] = useState(null);
  const fileInputRef = useRef(null);  // input 참조용
  const [detectedHighlights, setDetectedHighlights] = useState({});
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [loadingMessage, setLoadingMessage] = useState(''); // 로딩 메시지 추가
  const [isExporting, setIsExporting] = useState(false); // export 로딩 상태
  const [exportMessage, setExportMessage] = useState(''); // export 메시지
  const [highlightPages, setHighlightPages] = useState({});
  const [showTextOverlay, setShowTextOverlay] = useState(true); // 텍스트 오버레이 토글 상태
  const [showTransitionEffect, setShowTransitionEffect] = useState(true); // 페이드인아웃 효과 토글 상태
  const [helpModalOpen, setHelpModalOpen] = useState(false); // 도움말 모달 상태

  const [userEdits, setUserEdits] = useState([
    { start: 1800, end: 1830, note: 'Great dribble' },
  ]);

  const [selectedHighlights, setSelectedHighlights] = useState([]);
  
  // 저장 상태 관리
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [deletedHighlightIds, setDeletedHighlightIds] = useState(loadedDeletedIds || []);

  // Detected Highlights 탭 상태 추가
  const [highlightTab, setHighlightTab] = useState('');

  // detectedHighlights가 바뀔 때 탭 초기화
  useEffect(() => {
    const keys = Object.keys(detectedHighlights);
    if (keys.length > 0 && !highlightTab) {
      setHighlightTab(keys[0]);
    }
  }, [detectedHighlights]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event, newValue, endTime) => {
    if (typeof newValue === 'number' && isFinite(newValue)) {
      console.log('Seeking to:', newValue, 'End at:', endTime);
      setCurrentTime(newValue);
      if (videoRef.current) {
        videoRef.current.currentTime = newValue;
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
        setIsPlaying(true);

        // 종료 시점 설정
        setActiveHighlightEnd(endTime);
      }
    }
  };

  const handleSkip = (amount) => {
    const newTime = Math.max(0, Math.min(videoDuration, currentTime + amount));
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ontimeupdate = () => {
        const currentTime = videoRef.current.currentTime;
        setCurrentTime(currentTime);

        // 종료 시점에 도달하면 비디오 정지
        if (activeHighlightEnd && currentTime >= activeHighlightEnd) {
          videoRef.current.pause();
          setIsPlaying(false);
          setActiveHighlightEnd(null); // 종료 시점 초기화
        }
      };
    }
  }, [activeHighlightEnd]);

  useEffect(() => {
    // aiHighlights 또는 highlights 중 하나라도 있으면 type별로 자동 분류
    const source = aiHighlights && Array.isArray(aiHighlights) ? aiHighlights : highlights;
    if (source && Array.isArray(source)) {
      const categorized = {};
      source.forEach(h => {
        const cat = h.type || 'Unknown';
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push({ ...h, id: h.id });
      });
      setDetectedHighlights(categorized);
    } else {
      setDetectedHighlights({});
    }
  }, [aiHighlights, highlights]);

  // 저장 함수
  const saveHighlights = async () => {
    if (!fileId) {
      alert('파일 ID가 없습니다.');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveMessage('저장 중...');
      
      // detectedHighlights를 평면 배열로 변환
      const flattenedHighlights = [];
      Object.entries(detectedHighlights).forEach(([category, highlights]) => {
        highlights.forEach(h => flattenedHighlights.push(h));
      });
      
      const response = await axios.put(`http://172.17.174.197:8000/api/update-highlights/${fileId}/`, {
        highlights: flattenedHighlights,
        custom_highlights: customHighlights,
        deleted_highlight_ids: deletedHighlightIds
      });
      
      console.log('[SAVE] 저장 성공:', response.data);
      setHasUnsavedChanges(false);
      setSaveMessage('저장 완료!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('[SAVE] 저장 실패:', error);
      setSaveMessage('저장 실패!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 페이지 라우팅 이동 시 경고
  useEffect(() => {
    const unblock = () => {
      if (hasUnsavedChanges) {
        return window.confirm('저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?');
      }
      return true;
    };
    
    // React Router의 navigation blocking은 v6에서 다르게 처리되므로
    // 간단하게 window.onbeforeunload로 처리
    return () => {};
  }, [hasUnsavedChanges]);

  const handleSaveExport = () => {
    const a = document.createElement('a');
    a.href = videoSrc; // videoSrc가 이미 Blob URL이므로 그대로 사용
    a.download = 'exported-video.mp4'; // 저장할 파일 이름
    a.click();
  };

  const toggleHighlightSelection = (category, highlight) => {
    setSelectedHighlights(prev => {
      const exists = prev.find(h => h.category === category && h.id === highlight.id);
      if (exists) {
        return prev.filter(h => !(h.category === category && h.id === highlight.id));
      } else {
        return [...prev, { ...highlight, category }];
      }
    });
  };

  const handleDeleteHighlight = (category, highlightId) => {
    setDetectedHighlights(prev => ({
      ...prev,
      [category]: prev[category].filter(h => h.id !== highlightId)
    }));
    setSelectedHighlights(prev => prev.filter(h => !(h.category === category && h.id === highlightId)));
    setDeletedHighlightIds(prev => [...prev, highlightId]);
    setHasUnsavedChanges(true);  // 변경사항 표시
  };

  const handlePlayHighlight = (highlight) => {
    if (videoRef.current) {
      videoRef.current.currentTime = highlight.start;
      videoRef.current.play();
      setIsPlaying(true);
      setActiveHighlightEnd(highlight.end);
    }
  };

  const handleDeleteCustomHighlight = (id) => {
    setCustomHighlights(prev => {
      const removed = prev.find(h => h.id === id);
      // 선택된 목록에서도 제거
      setSelectedHighlights(sel => sel.filter(h => {
        if (h.category !== null) return true;
        if (h.id && h.id === id) return false;
        if (removed && h.start === removed.start && h.end === removed.end) return false;
        return true;
      }));
      setHasUnsavedChanges(true);  // 변경사항 표시
      return prev.filter(h => h.id !== id);
    });
  };

  const handleExportSelected = async () => {
    if (selectedHighlights.length === 0) {
      alert('Please select at least one highlight');
      return;
    }
    try {
      setIsExporting(true);
      setExportMessage('영상 편집 중입니다. 잠시만 기다려주세요...');
      // 선택된 하이라이트만 start, end, type, category, name 추출해서 정렬
      const sortedHighlights = selectedHighlights
        .map(h => ({ 
          start: h.start, 
          end: h.end, 
          type: h.type || 'Highlight',
          category: h.category || '',
          ...(h.name && { name: h.name })  // custom highlights의 경우 name 포함
        }))
        .sort((a, b) => a.start - b.start);
      const response = await fetch('http://172.17.174.197:8000/api/export-highlights/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoName: fileId, // MainPage에서 전달된 서버 저장 파일명
          ranges: sortedHighlights, // [{start: 10, end: 20}, ...] 선택된 것만
          showTextOverlay: showTextOverlay, // 텍스트 오버레이 표시 여부
          showTransitionEffect: showTransitionEffect, // 페이드인아웃 효과 표시 여부
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || '영상 편집에 실패했습니다.';
        setExportMessage(errorMsg);
        setIsExporting(false);
        setTimeout(() => setExportMessage(''), 5000);
        alert(errorMsg);
        return;
      }
      const blob = await response.blob();
      
      // 기본 파일명을 업로드 영상명 기반으로 생성
      let baseFilename = 'exported_highlights.mp4';
      if (fileId) {
        // fileId를 문자열로 변환하고 원본 파일명 추출 (확장자 제거)
        const fileIdStr = String(fileId);
        const originalName = fileIdStr.replace(/\.[^/.]+$/, ""); // 확장자 제거
        baseFilename = `${originalName}_edited_highlights.mp4`;
      }
      
      let filename = baseFilename;
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition
          .split('filename=')[1]
          .replace(/['"]/g, '')
          .trim();
      }
      setExportMessage('영상 편집이 완료되었습니다!');
      setIsExporting(false);
      
      // 저장 다이얼로그 표시
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // 네이티브 파일 저장 다이얼로그 표시
      a.download = filename; // 기본 파일명 설정
      a.click();
      setExportMessage('저장이 완료되었습니다!');
      
      a.remove();
      window.URL.revokeObjectURL(url);
      setTimeout(() => setExportMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting highlights:', error);
      
      // 네트워크 오류 처리
      let errorMsg = '영상 편집에 실패했습니다.';
      if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK') {
        errorMsg = '네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도해주세요.';
      } else if (error.response?.status === 500) {
        errorMsg = '서버에서 영상 처리 중 오류가 발생했습니다.';
      } else if (error.response?.status === 404) {
        errorMsg = '원본 영상 파일을 찾을 수 없습니다.';
      }
      
      setExportMessage(errorMsg);
      setIsExporting(false);
      setTimeout(() => setExportMessage(''), 5000);
      alert(errorMsg + ' 다시 시도해주세요.');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddCustomHighlight = () => {
    // 시, 분, 초를 초 단위로 변환
    const start =
      (parseInt(customStartHour || '0', 10) * 3600) +
      (parseInt(customStartMinute || '0', 10) * 60) +
      (parseInt(customStartSecond || '0', 10));
    const end =
      (parseInt(customEndHour || '0', 10) * 3600) +
      (parseInt(customEndMinute || '0', 10) * 60) +
      (parseInt(customEndSecond || '0', 10));

    if (isNaN(start) || isNaN(end) || start >= end) {
      alert('올바른 시작/종료 시간을 입력하세요. (시작 < 종료)');
      return;
    }

    // 영상 길이 확인
    const videoDuration = videoRef.current?.duration || 0;
    if (videoDuration > 0 && end > videoDuration) {
      alert('종료 시간이 영상 길이를 초과합니다.');
      return;
    }

    setCustomHighlights([...customHighlights, {
      id: Date.now(), // 고유 ID 추가
      name: customName,
      start: start,
      end: end,
      type: customName || 'Custom'  // type 필드 추가
    }]);
    setCustomName('');
    setCustomStartHour(''); setCustomStartMinute(''); setCustomStartSecond('');
    setCustomEndHour(''); setCustomEndMinute(''); setCustomEndSecond('');
    setHasUnsavedChanges(true);  // 변경사항 표시
    handleClose();
  };
  const handleNewVideoUploadClick = () => {
    fileInputRef.current.click(); // 숨겨진 input 클릭
  };

  const handleNewFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      setLoadingMessage('중복 영상 확인 중...');
      // 1. check-duplicate API로 이름 중복 먼저 확인
      try {
        const checkRes = await axios.post('http://172.17.174.197:8000/api/check-duplicate/', { filename: file.name });
        if (checkRes.data && checkRes.data.is_duplicate) {
          setDetectedHighlights({
            ...Object.entries(checkRes.data.highlights || {}).reduce((acc, [k, v]) => {
              if (Array.isArray(v)) acc[k] = v;
              return acc;
            }, {})
          });
          setLoadingMessage('기존 분석 결과를 불러왔습니다!');
          setTimeout(() => setLoadingMessage(''), 1000);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // 중복 체크 실패 시 무시하고 업로드 진행
        console.error('중복 체크 오류:', e);
      }
      setLoadingMessage('영상 업로드 및 분석 중...');
      const url = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append('file', file);
      try {
        // 업로드 + 분석
        const uploadResponse = await axios.post('http://172.17.174.197:8000/api/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadResponse.data && Array.isArray(uploadResponse.data.highlights)) {
          setDetectedHighlights({
            ...Object.entries(uploadResponse.data.highlights || {}).reduce((acc, [k, v]) => {
              if (Array.isArray(v)) acc[k] = v;
              return acc;
            }, {})
          });
        } else {
          setDetectedHighlights({});
        }
        setLoadingMessage('완료!');
        setTimeout(() => setLoadingMessage(''), 1000);
        setIsLoading(false);
      } catch (error) {
        setLoadingMessage('오류 발생!');
        setIsLoading(false);
        console.error('Error uploading/analyzing new video:', error);
      }
    }
  };

  const handlePageChange = (category, newPage) => {
    setHighlightPages(prev => ({
      ...prev,
      [category]: newPage
    }));
  };

  // 비디오 프레임에 키보드 이벤트 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement === videoRef.current) {
        if (e.key === 'ArrowLeft') {
          handleSkip(-10);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          handleSkip(10);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, videoDuration]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', minHeight: '100vh', background: '#ffffff' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eef2f7', backdropFilter: 'saturate(180%) blur(4px)' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            AI Sports Editor
          </Typography>
          
          {/* 저장 상태 표시 */}
          {hasUnsavedChanges && !isSaving && (
            <Chip 
              label="저장되지 않음" 
              size="small" 
              color="warning" 
              sx={{ mr: 2 }}
            />
          )}
          {saveMessage && (
            <Typography 
              variant="body2" 
              color={saveMessage.includes('완료') ? 'success.main' : saveMessage.includes('실패') ? 'error.main' : 'primary'} 
              sx={{ mr: 2 }}
            >
              {saveMessage}
            </Typography>
          )}
          
          {/* Save 버튼 */}
          <Button 
            startIcon={<Save />} 
            onClick={saveHighlights} 
            disabled={!hasUnsavedChanges || isSaving}
            sx={{ 
              mr: 1,
              bgcolor: hasUnsavedChanges ? '#2e7d32' : '#e0e0e0', 
              color: hasUnsavedChanges ? '#fff' : '#757575',
              '&:hover': { bgcolor: hasUnsavedChanges ? '#1b5e20' : '#d0d0d0' }
            }}
          >
            {isSaving ? '저장 중...' : 'Save'}
          </Button>
          
          <Button startIcon={<CloudUpload />} onClick={handleNewVideoUploadClick} disabled={isLoading} sx={{ mr: 1, bgcolor: '#111827', color: '#fff', '&:hover': { bgcolor: '#0b1220' } }}>
            Upload New Video
          </Button>
          
          <Button startIcon={<HelpIcon />} onClick={() => setHelpModalOpen(true)} sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565c0' } }}>
            Help
          </Button>
          {isLoading && (
            <Typography variant="body2" color="primary" sx={{ ml: 2 }}>
              {loadingMessage}
            </Typography>
          )}
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleNewFileChange}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              style={{
                width: '100%',
                maxWidth: 1100,
                aspectRatio: '16/9',
                backgroundColor: 'black',
                marginBottom: '16px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: 16,
                boxShadow: '0 12px 32px rgba(17,24,39,0.15)'
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setVideoDuration(videoRef.current.duration);
                }
              }}
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            />
          ) : (
            <Box sx={{
              width: '100%',
              maxWidth: 1100,
              aspectRatio: '16/9',
              bgcolor: 'black',
              mb: 2,
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 16,
              boxShadow: '0 12px 32px rgba(17,24,39,0.15)'
            }} />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, bgcolor: '#ffffff', border: '1px solid #eceff4', borderRadius: 12, boxShadow: '0 6px 16px rgba(17,24,39,0.06)' }}>
            <IconButton onClick={() => handleSkip(-10)}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={handlePlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={() => handleSkip(10)}>
              <SkipNext />
            </IconButton>
            <CustomSlider
              value={currentTime}
              onChange={(event, newValue) => handleSeek(event, newValue, null)}
              min={0}
              max={videoDuration}
              marks={HighlightMarks({
                highlights: detectedHighlights.Goals,
                duration: videoDuration
              })}
              sx={{ mx: 2, flexGrow: 1 }}
            />
            <Typography variant="body2">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </Typography>
            <CustomSlider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              sx={{ width: 100, ml: 2 }}
            />
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }} TabIndicatorProps={{ sx: { backgroundColor: '#111827', height: 3 } }}>
            <Tab label="Timeline" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Match Timeline</Typography>
                <Button startIcon={<Add />} onClick={handleOpen} sx={{ borderRadius: 10, bgcolor: '#111827', color: '#fff', '&:hover': { bgcolor: '#0b1220' } }}>
                  Add Custom Highlight
                </Button>
              </Box>
              <Box sx={{
                height: 80,
                bgcolor: '#ffffff',
                position: 'relative',
                mb: 2,
                width: '100%',
                border: '1px solid #eceff4',
                borderRadius: 0,
                boxShadow: '0 6px 16px rgba(17,24,39,0.06)'
              }}>
                {Object.entries(detectedHighlights || {}).map(([category, highlights]) =>
                  Array.isArray(highlights) && highlights.length > 0 && highlights.map((highlight, index) => {
                    const isSelected = !!selectedHighlights.find(h => h.category === category && h.id === highlight.id);
                    const baseColor = EVENT_COLORS[category] || '#1976D2';
                    return (
                      <Tooltip key={`${category}-${index}`} title={`${category} • ${formatTime(highlight.start)} - ${formatTime(highlight.end)}`} arrow>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${(highlight.start / videoDuration) * 100}%`,
                            width: `max(${((highlight.end - highlight.start) / videoDuration) * 100}%, 6px)`,
                            minWidth: '6px',
                            height: '100%',
                            bgcolor: isSelected ? '#111827' : baseColor,
                            opacity: isSelected ? 1 : 0.8,
                            borderRadius: 0,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = highlight.start;
                              videoRef.current.play();
                            }
                          }}
                        />
                      </Tooltip>
                    );
                  })
                )}
                {customHighlights.map((highlight, index) => {
                  const isSelected = !!selectedHighlights.find(h => h.category === null && h.id === highlight.id);
                  return (
                    <Tooltip key={`custom-${index}`} title={`custom • ${formatTime(highlight.start)} - ${formatTime(highlight.end)}`} arrow>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${(highlight.start / videoDuration) * 100}%`,
                          width: `max(${((highlight.end - highlight.start) / videoDuration) * 100}%, 6px)`,
                          minWidth: '6px',
                          height: '100%',
                          bgcolor: isSelected ? '#111827' : '#808080',   // 회색 (Material grey 500)
                          opacity: isSelected ? 1 : 0.8,
                          borderRadius: 0,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = highlight.start;
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
              {/* Color legend under timeline */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {Object.entries(EVENT_COLORS).map(([cat, color]) => (
                  <Chip key={`legend-${cat}`} label={cat} size="small" sx={{ borderColor: color, color, borderWidth: 1, borderStyle: 'solid' }} variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ width: 300, p: 3, borderLeft: '1px solid #eef2f7', bgcolor: '#ffffff' }}>
          <Typography variant="h6" gutterBottom>
            Detected Highlights
          </Typography>
          {/* Overview chips: categories at a glance */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {Object.keys(detectedHighlights).map((cat) => {
              const count = (detectedHighlights[cat] || []).length;
              const color = EVENT_COLORS[cat] || '#333';
              return (
                <Chip
                  key={`overview-${cat}`}
                  size="small"
                  label={`${cat} (${count})`}
                  onClick={() => setHighlightTab(cat)}
                  sx={{
                    borderColor: color,
                    color,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    cursor: 'pointer'
                  }}
                  variant={highlightTab === cat ? 'filled' : 'outlined'}
                  color={highlightTab === cat ? 'primary' : 'default'}
                />
              );
            })}
          </Box>
          {/* 카테고리별 탭 UI */}
          {Object.keys(detectedHighlights).length > 0 && highlightTab && (
            <Tabs
              value={highlightTab}
              onChange={(e, newValue) => setHighlightTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
              TabIndicatorProps={{ sx: { backgroundColor: '#111827', height: 3 } }}
            >
              {Object.keys(detectedHighlights).map((cat) => {
                const count = (detectedHighlights[cat] || []).length;
                const color = EVENT_COLORS[cat] || '#333';
                return (
                  <Tab
                    key={cat}
                    value={cat}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: color, borderRadius: '2px' }} />
                        <span>{cat}</span>
                        <Chip size="small" label={count} />
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          )}
          {/* 탭별 하이라이트만 보여주기 */}
          {(() => {
            const highlights = detectedHighlights[highlightTab] || [];
            if (highlights.length === 0) return <Typography>No highlights</Typography>;
            const page = highlightPages[highlightTab] || 0;
            const pageSize = 4;
            const maxPage = Math.ceil(highlights.length / pageSize) - 1;
            const currentItems = highlights.slice(page * pageSize, (page + 1) * pageSize);
            const color = EVENT_COLORS[highlightTab] || '#333';
            return (
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', color, fontSize: 20 }}
                >
                  {highlightTab}
                </Typography>
                <List sx={{ mt: 0 }}>
                  {currentItems.map((highlight) => (
                    <ListItem key={highlight.id} secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton edge="end" onClick={() => toggleHighlightSelection(highlightTab, highlight)}>
                          {selectedHighlights.find(h => h.category === highlightTab && h.id === highlight.id)
                            ? <CheckCircle />
                            : <RadioButtonUnchecked />}
                        </IconButton>
                        <IconButton edge="end" onClick={() => handlePlayHighlight(highlight)}>
                          <PlayArrow />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteHighlight(highlightTab, highlight.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    } sx={{ borderLeft: `4px solid ${color}` }}>
                      <ListItemText
                        primary={highlight.type}
                        secondary={<span style={{ fontWeight: 600 }}>{formatTime(highlight.start)} - {formatTime(highlight.end)}</span>}
                        sx={{ pr: 3 }}
                      />
                    </ListItem>
                  ))}
                </List>
                {highlights.length > pageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => handlePageChange(highlightTab, Math.max(0, page - 1))}
                      disabled={page === 0}
                    >{"<"}</Button>
                    <Typography sx={{ mx: 1 }}>{page + 1} / {maxPage + 1}</Typography>
                    <Button
                      size="small"
                      onClick={() => handlePageChange(highlightTab, Math.min(maxPage, page + 1))}
                      disabled={page === maxPage}
                    >{" > "}</Button>
                  </Box>
                )}
              </Box>
            );
          })()}

          <Typography variant="h6" gutterBottom>
            Custom Highlights
          </Typography>
          <List>
            {customHighlights.map((highlight, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: selectedHighlights.find(h => h.start === highlight.start && h.end === highlight.end)
                    ? 'action.selected'
                    : 'transparent',
                  borderRadius: 12,
                  mb: 1,
                  border: '1px solid #eceff4'
                }}
              >
                <ListItemText
                  primary={highlight.name || `Custom Highlight ${index + 1}`}
                  secondary={`${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => toggleHighlightSelection(null, highlight)}
                  >
                    {selectedHighlights.find(h => h.start === highlight.start && h.end === highlight.end)
                      ? <CheckCircle color="primary" />
                      : <RadioButtonUnchecked />}
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      console.log('Highlight Start:', highlight.start);
                      handleSeek(undefined, highlight.start, highlight.end);
                    }}
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteCustomHighlight(highlight.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Typography variant="h6" gutterBottom>
            Editing options
          </Typography>
          {/* 편집 옵션 토글들 */}
          <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
            {/* 텍스트 오버레이 토글 */}
            <FormControlLabel
              control={
                <Switch
                  checked={showTextOverlay}
                  onChange={(e) => setShowTextOverlay(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextFields fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Text overlay
                  </Typography>
                </Box>
              }
            />
            {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1 }}>
              각 하이라이트에 이벤트 정보를 텍스트로 표시합니다
            </Typography> */}
            
            {/* 페이드인아웃 효과 토글 */}
            <FormControlLabel
              control={
                <Switch
                  checked={showTransitionEffect}
                  onChange={(e) => setShowTransitionEffect(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Slideshow fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Fade transition
                  </Typography>
                </Box>
              }
            />
            {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              장면 전환 시 이벤트 정보를 페이드인아웃으로 표시합니다
            </Typography> */}
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleExportSelected}
            disabled={selectedHighlights.length === 0 || isExporting}
            sx={{ mt: 1, bgcolor: '', '&:hover': { bgcolor: '#1a4fba' }, borderRadius: 12 }}
          >
            Export Selected Highlights
          </Button>
          {isExporting && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {exportMessage}
            </Typography>
          )}
          {!isExporting && exportMessage && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {exportMessage}
            </Typography>
          )}
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ ...modalStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 320 }}>
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Add Custom Highlight
          </Typography>
          <TextField
            label="Highlight Name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            margin="normal"
            sx={{ mb: 2, maxWidth: 300, width: '100%' }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Start Time (HH:MM:SS)</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, maxWidth: 300 }}>
            <TextField
              label="Hour"
              value={customStartHour}
              onChange={e => setCustomStartHour(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
            <TextField
              label="Minute"
              value={customStartMinute}
              onChange={e => setCustomStartMinute(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
            <TextField
              label="Second"
              value={customStartSecond}
              onChange={e => setCustomStartSecond(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>End Time (HH:MM:SS)</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, maxWidth: 300 }}>
            <TextField
              label="Hour"
              value={customEndHour}
              onChange={e => setCustomEndHour(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
            <TextField
              label="Minute"
              value={customEndMinute}
              onChange={e => setCustomEndMinute(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
            <TextField
              label="Second"
              value={customEndSecond}
              onChange={e => setCustomEndSecond(e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ maxLength: 2 }}
              sx={{ width: 90 }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleAddCustomHighlight}>Add</Button>
          </Box>
        </Box>
      </Modal>
      
      {/* 도움말 모달 */}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </Box>
  );
}