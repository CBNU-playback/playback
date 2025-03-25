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
  const { videoSrc, fileId } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // videoDuration을 상태로 설정
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [volume, setVolume] = useState(1); // 음량 상태 추가
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customHighlights, setCustomHighlights] = useState([]);
  const [customName, setCustomName] = useState(''); // 이름 상태 추가
  const [activeHighlightEnd, setActiveHighlightEnd] = useState(null);
  const fileInputRef = useRef(null);  // input 참조용

  const aiHighlights = [
    { id: 1, type: 'Goal Scene', start: 15, end: 35, selected: false },
    { id: 2, type: 'Free Kick', start: 50, end: 60, selected: false },
    { id: 3, type: 'Penalty Kick', start: 245, end: 265, selected: false },
    { id: 4, type: 'Yellow Card', start: 380, end: 395, selected: false },
    { id: 5, type: 'Corner Kick', start: 450, end: 470, selected: false }
  ];

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

  const handleSaveExport = () => {
    const a = document.createElement('a');
    a.href = videoSrc; // videoSrc가 이미 Blob URL이므로 그대로 사용
    a.download = 'exported-video.mp4'; // 저장할 파일 이름
    a.click();
  };

  const toggleHighlightSelection = (highlight) => {
    setSelectedHighlights(prev => {
      // id가 있는 경우 (AI 하이라이트)
      if (highlight.id) {
        const exists = prev.find(h => h.id === highlight.id);
        if (exists) {
          return prev.filter(h => h.id !== highlight.id);
        } else {
          return [...prev, highlight];
        }
      }
      // id가 없는 경우 (커스텀 하이라이트)
      else {
        const exists = prev.find(h =>
          h.start === highlight.start &&
          h.end === highlight.end &&
          h.name === highlight.name
        );
        if (exists) {
          return prev.filter(h =>
            h.start !== highlight.start ||
            h.end !== highlight.end ||
            h.name !== highlight.name
          );
        } else {
          return [...prev, highlight];
        }
      }
    });
  };

  const handleExportSelected = async () => {
    if (selectedHighlights.length === 0) {
      alert('Please select at least one highlight');
      return;
    }

    try {
      // 정렬된 하이라이트 구간
      const sortedHighlights = selectedHighlights
        .map(h => ({ start: h.start, end: h.end }))
        .sort((a, b) => a.start - b.start);

      const response = await fetch('http://localhost:8000/api/export-highlights/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoName: fileId, // MainPage에서 전달된 서버 저장 파일명
          ranges: sortedHighlights, // [{start: 10, end: 20}, {start: 40, end: 60}]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export video');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_highlights.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting highlights:', error);
      alert('Failed to export highlights. Please try again.');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddCustomHighlight = () => {
    const start = parseFloat(customStart);
    const end = parseFloat(customEnd);

    // 유효한 숫자인지 확인
    if (isNaN(start) || isNaN(end)) {
      alert('Please enter valid numbers for start and end times');
      return;
    }

    setCustomHighlights([...customHighlights, {
      id: Date.now(), // 고유 ID 추가
      name: customName,
      start: start,
      end: end
    }]);
    setCustomName('');
    setCustomStart('');
    setCustomEnd('');
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
        const response = await axios.post('http://localhost:8000/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('New video upload success:', response.data);

        // 새로 업로드된 파일로 /edit 페이지 새로 이동
        navigate('/edit', { state: { videoSrc: url, fileId: response.data.file_id } });
      } catch (error) {
        console.error('Error uploading new video:', error);
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
          <Button startIcon={<CloudUpload />} onClick={handleNewVideoUploadClick}>
            Upload New Video
          </Button>
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
                highlights: aiHighlights,
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
                {aiHighlights.map((highlight, index) => (
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
                {aiHighlights
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
          <List>
            {aiHighlights.map((highlight) => (
              <ListItem
                key={highlight.id}
                sx={{
                  bgcolor: selectedHighlights.find(h => h.id === highlight.id)
                    ? 'action.selected'
                    : 'transparent',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={highlight.type}
                  secondary={`${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => toggleHighlightSelection(highlight)}
                  >
                    {selectedHighlights.find(h => h.id === highlight.id)
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
                    onClick={() => toggleHighlightSelection(highlight)}
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
            disabled={selectedHighlights.length === 0}
            sx={{ mt: 2 }}
          >
            Export Selected Highlights
          </Button>
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Add Custom Highlight
          </Typography>
          <TextField
            label="Highlight Name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Start Time (seconds)"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="End Time (seconds)"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleAddCustomHighlight}>Add</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
