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
      backgroundColor: '#ff9800',
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

export default function FootballVideoEditor() {
  const location = useLocation();
  const { videoSrc } = location.state || {}; // AIVideoEditor에서 전달된 videoSrc 받음
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // videoDuration을 상태로 설정
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSeek = (event, newValue) => {
    if (typeof newValue === 'number' && isFinite(newValue)) {
      setCurrentTime(newValue);
      if (videoRef.current) {
        videoRef.current.currentTime = newValue;
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ontimeupdate = () => {
        setCurrentTime(videoRef.current.currentTime);
      };
    }
  }, []);

  const handleSaveExport = () => {
    const a = document.createElement('a');
    a.href = videoSrc; // videoSrc가 이미 Blob URL이므로 그대로 사용
    a.download = 'exported-video.mp4'; // 저장할 파일 이름
    a.click();
  };
  const openPreviewWindow = () => {
    const previewWindow = window.open(
      '',
      'VideoPreview',
      'width=800,height=600'
    );

    previewWindow.document.write(`
      <html>
        <head>
          <title>Video Preview</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif; margin: 0; }
            .video-container { max-width: 100%; max-height: 80%; }
            .button-group { margin-top: 20px; display: flex; gap: 10px; }
          </style>
        </head>
        <body>
          <div class="video-container">
            <video id="previewVideo" controls width="600" src="${videoSrc}"></video>
          </div>
          <div class="button-group">
            <button id="saveButton">Download</button>
            <button id="continueButton">Cancle</button>
          </div>
          <script>
            document.getElementById('saveButton').addEventListener('click', function() {
              const link = document.createElement('a');
              link.href = '${videoSrc}';
              link.download = 'edited-video.mp4';
              link.click();
            });

            document.getElementById('continueButton').addEventListener('click', function() {
              window.close();
            });
          </script>
        </body>
      </html>
    `);
  };

  const toggleHighlightSelection = (highlight) => {
    setSelectedHighlights(prev => {
      const exists = prev.find(h => h.id === highlight.id);
      if (exists) {
        return prev.filter(h => h.id !== highlight.id);
      } else {
        return [...prev, highlight];
      }
    });
  };

  const handleExportSelected = async () => {
    if (selectedHighlights.length === 0) {
      alert('Please select at least one highlight');
      return;
    }

    try {
      // 선택된 하이라이트를 시간순으로 정렬
      const sortedHighlights = selectedHighlights.sort((a, b) => a.start - b.start);
      
      // MediaRecorder 설정
      const stream = videoRef.current.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'highlights.mp4';
        a.click();
        URL.revokeObjectURL(url);
      };

      // 녹화 시작
      mediaRecorder.start();

      // 각 하이라이트 구간 처리
      for (const highlight of sortedHighlights) {
        // 비디오 시간을 하이라이트 시작 지점으로 이동
        videoRef.current.currentTime = highlight.start;
        await new Promise(resolve => {
          videoRef.current.onseeked = () => {
            // 하이라이트 구간 재생
            videoRef.current.play();
            setTimeout(() => {
              videoRef.current.pause();
              resolve();
            }, (highlight.end - highlight.start) * 1000);
          };
        });
      }

      // 녹화 종료
      mediaRecorder.stop();
      videoRef.current.currentTime = 0; // 비디오를 처음으로 되돌림

    } catch (error) {
      console.error('Error exporting highlights:', error);
      alert('Failed to export highlights. Please try again.');
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
          <Button startIcon={<CloudUpload />}>
            Upload New Video
          </Button>
          <Button startIcon={<Save />} onClick={openPreviewWindow}>
            Preview & Download
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              width="100%"
              style={{ aspectRatio: '16/9', backgroundColor: 'black', marginBottom: '16px' }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setVideoDuration(videoRef.current.duration); // 동영상 길이 설정
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
              onChange={handleSeek}
              min={0}
              max={videoDuration}
              marks={HighlightMarks({ 
                highlights: selectedHighlights, 
                duration: videoDuration 
              })}
              sx={{ mx: 2, flexGrow: 1 }}
            />
            <Typography variant="body2">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </Typography>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Timeline" />
            <Tab label="Player Highlights" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Match Timeline</Typography>
                <Button startIcon={<Add />}>
                  Add Custom Highlight
                </Button>
              </Box>
              <Box sx={{ height: 100, bgcolor: 'grey.200', position: 'relative', mb: 2 }} />
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
                        <IconButton edge="end" aria-label="play" onClick={() => handleSeek(null, highlight.start)}>
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
            AI Detected Highlights
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
                    onClick={() => handleSeek(highlight.start)}
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
    </Box>
  );
}
