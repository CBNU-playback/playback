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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';


const CustomSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-rail': {
    backgroundColor: '#e0e0e0',
    height: 4,
  },
  '& .MuiSlider-track': {
    backgroundColor: '#1976d2',
    height: 4,
  },
  '& .MuiSlider-thumb': {
    width: 8,
    height: 20,
    borderRadius: 2,
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
      borderRadius: '4px',
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

export default function FootballVideoEditor() {
  const location = useLocation();
  const { videoSrc, fileId, aiHighlights, highlights } = location.state || {};
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
  const [customHighlights, setCustomHighlights] = useState([]);
  const [customName, setCustomName] = useState(''); // 이름 상태 추가
  const [activeHighlightEnd, setActiveHighlightEnd] = useState(null);
  const fileInputRef = useRef(null);  // input 참조용
  const [detectedHighlights, setDetectedHighlights] = useState({
    Goals: [],
    Shoot: [],
    FreeKicks: [],
    Fouls: []
  });
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [loadingMessage, setLoadingMessage] = useState(''); // 로딩 메시지 추가
  const [isExporting, setIsExporting] = useState(false); // export 로딩 상태
  const [exportMessage, setExportMessage] = useState(''); // export 메시지

  const [userEdits, setUserEdits] = useState([
    { start: 1800, end: 1830, note: 'Great dribble' },
  ]);

  const [selectedHighlights, setSelectedHighlights] = useState([]);

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
    if (aiHighlights && Array.isArray(aiHighlights)) {
      setDetectedHighlights({
        Goals: aiHighlights.map((h, idx) => ({
          ...h,
          type: 'Goal Scene',
          id: h.id || idx + 1,
        })),
        Shoot: [],
        FreeKicks: [],
        Fouls: []
      });
    } else if (highlights && Array.isArray(highlights)) {
      setDetectedHighlights({
        Goals: highlights.map((h, idx) => ({
          ...h,
          type: 'Goal Scene',
          id: h.id || idx + 1,
        })),
        Shoot: [],
        FreeKicks: [],
        Fouls: []
      });
    }
  }, [aiHighlights, highlights]);

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
  };

  const handlePlayHighlight = (highlight) => {
    if (videoRef.current) {
      videoRef.current.currentTime = highlight.start;
      videoRef.current.play();
      setIsPlaying(true);
      setActiveHighlightEnd(highlight.end);
    }
  };

  const handleExportSelected = async () => {
    if (selectedHighlights.length === 0) {
      alert('Please select at least one highlight');
      return;
    }
    try {
      setIsExporting(true);
      setExportMessage('영상 편집 중입니다. 잠시만 기다려주세요...');
      // 선택된 하이라이트만 start, end 추출해서 정렬
      const sortedHighlights = selectedHighlights
        .map(h => ({ start: h.start, end: h.end }))
        .sort((a, b) => a.start - b.start);
      const response = await fetch('http://172.17.174.197:8000/api/export-highlights/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoName: fileId, // MainPage에서 전달된 서버 저장 파일명
          ranges: sortedHighlights, // [{start: 10, end: 20}, ...] 선택된 것만
        }),
      });
      if (!response.ok) {
        setExportMessage('영상 편집에 실패했습니다.');
        setIsExporting(false);
        throw new Error('Failed to export video');
      }
      const blob = await response.blob();
      let filename = 'exported_highlights.mp4';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition
          .split('filename=')[1]
          .replace(/['"]/g, '')
          .trim();
      }
      setExportMessage('다운로드를 시작합니다!');
      setIsExporting(false);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setTimeout(() => setExportMessage(''), 2000);
    } catch (error) {
      setExportMessage('영상 편집에 실패했습니다.');
      setIsExporting(false);
      console.error('Error exporting highlights:', error);
      alert('Failed to export highlights. Please try again.');
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

    setCustomHighlights([...customHighlights, {
      id: Date.now(), // 고유 ID 추가
      name: customName,
      start: start,
      end: end
    }]);
    setCustomName('');
    setCustomStartHour(''); setCustomStartMinute(''); setCustomStartSecond('');
    setCustomEndHour(''); setCustomEndMinute(''); setCustomEndSecond('');
    handleClose();
  };
  const handleNewVideoUploadClick = () => {
    fileInputRef.current.click(); // 숨겨진 input 클릭
  };

  const handleNewFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append('file', file);
      try {
        setIsLoading(true);
        setLoadingMessage('영상 업로드 및 분석 중...');
        // 업로드 + 분석
        const uploadResponse = await axios.post('http://172.17.174.197:8000/api/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // 반환된 highlights만 사용, Goals에만 넣기
        if (uploadResponse.data && Array.isArray(uploadResponse.data.highlights)) {
          setDetectedHighlights({
            Goals: uploadResponse.data.highlights.map((h, idx) => ({
              ...h,
              type: 'Goal Scene',
              id: h.id || idx + 1,
            })),
            Shoot: [],
            FreeKicks: [],
            Fouls: []
          });
        } else {
          setDetectedHighlights({ Goals: [], Shoot: [], FreeKicks: [], Fouls: [] });
        }
        setLoadingMessage('완료!');
        setTimeout(() => setLoadingMessage(''), 1000);
        setIsLoading(false);
        // 필요하다면 navigate로 넘길 때도 highlights만 넘김
        // navigate('/edit', { state: { videoSrc: url, fileId: uploadResponse.data.file_id, highlights } });
      } catch (error) {
        setLoadingMessage('오류 발생!');
        setIsLoading(false);
        console.error('Error uploading/analyzing new video:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0}>
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
          <Button startIcon={<CloudUpload />} onClick={handleNewVideoUploadClick} disabled={isLoading}>
            Upload New Video
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
              width="100%"
              style={{ aspectRatio: '16/9', backgroundColor: 'black', marginBottom: '16px' }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  console.log('Video loaded, duration:', videoRef.current.duration);
                  setVideoDuration(videoRef.current.duration);
                }
              }}
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            />
          ) : (
            <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: 'black', mb: 2 }} />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Timeline" />
            <Tab label="Player Highlights" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Match Timeline</Typography>
                <Button startIcon={<Add />} onClick={handleOpen}>
                  Add Custom Highlight
                </Button>
              </Box>
              <Box sx={{ height: 80, bgcolor: 'grey.200', position: 'relative', mb: 2 }}>
                {detectedHighlights.Goals.map((highlight, index) => (
                  <Box
                    key={`ai-${index}`}
                    sx={{
                      position: 'absolute',
                      left: `${(highlight.start / videoDuration) * 100}%`,
                      width: `${((highlight.end - highlight.start) / videoDuration) * 100}%`,
                      height: '100%',
                      bgcolor: '#1976D2',
                      opacity: 0.7,
                    }}
                  />
                ))}
                {customHighlights.map((highlight, index) => (
                  <Box
                    key={`custom-${index}`}
                    sx={{
                      position: 'absolute',
                      left: `${(highlight.start / videoDuration) * 100}%`,
                      width: `${((highlight.end - highlight.start) / videoDuration) * 100}%`,
                      height: '100%',
                      bgcolor: '#345DA7',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </Box>
              <List>
                {userEdits.map((edit, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Custom Edit ${index + 1}`}
                      secondary={`${formatTime(edit.start)} - ${formatTime(edit.end)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Player</InputLabel>
                <Select
                  value={selectedPlayer}
                  label="Select Player"
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                >
                  <MenuItem value="player-a">Player A</MenuItem>
                  <MenuItem value="player-b">Player B</MenuItem>
                  <MenuItem value="goalkeeper">Goalkeeper</MenuItem>
                </Select>
              </FormControl>
              <List>
                {detectedHighlights.Goals
                  .filter((highlight) => highlight.player.toLowerCase() === selectedPlayer.replace('-', ' '))
                  .map((highlight, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={highlight.type}
                        secondary={`${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            console.log('Highlight Start:', highlight.start);
                            handleSeek(undefined, highlight.start, highlight.end);
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
        </Box>

        <Box sx={{ width: 300, p: 3, borderLeft: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Detected Highlights
          </Typography>
          {/* 카테고리별로 출력 */}
          {Object.entries(detectedHighlights).map(([category, highlights]) => (
            highlights.length > 0 && (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{category}</Typography>
                <List>
                  {highlights.map((highlight) => (
                    <ListItem key={highlight.id} secondaryAction={
                      <>
                        {/* 동그라미(선택) */}
                        <IconButton edge="end" onClick={() => toggleHighlightSelection(category, highlight)}>
                          {selectedHighlights.find(h => h.category === category && h.id === highlight.id)
                            ? <CheckCircle color="primary" />
                            : <RadioButtonUnchecked />}
                        </IconButton>
                        {/* 세모(재생) */}
                        <IconButton edge="end" onClick={() => handlePlayHighlight(highlight)}>
                          <PlayArrow />
                        </IconButton>
                        {/* 휴지통(삭제) */}
                        <IconButton edge="end" onClick={() => handleDeleteHighlight(category, highlight.id)}>
                          <Delete />
                        </IconButton>
                      </>
                    }>
                      <ListItemText
                        primary={highlight.type}
                        secondary={`${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )
          ))}

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
                  borderRadius: 1,
                  mb: 1
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
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleExportSelected}
            disabled={selectedHighlights.length === 0 || isExporting}
            sx={{ mt: 2 }}
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
            <Button onClick={handleClose} sx={{ mr: 1 }}>CANCEL</Button>
            <Button variant="contained" onClick={handleAddCustomHighlight}>ADD</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}