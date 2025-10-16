import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Grid,
  Button,
  Box,
  CircularProgress,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import { CloudUpload as UploadIcon, Edit as EditIcon, Psychology as AIIcon, VideoLibrary as VideoIcon, AutoAwesome as MagicIcon } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  section: {
    marginTop: theme.spacing(4),
  },
  content: {
    marginTop: theme.spacing(2),
  },
  heroImage: {
    width: '100%',
    maxWidth: 600,
    height: 'auto',
    marginBottom: theme.spacing(4),
  }
}));

function MainPage() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('파일 이름:', file.name);
      setIsLoading(true);
      setLoadingStep(0);
      setProgress(0);
      
      // Step 1: Checking for duplicates
      setLoadingMessage('Checking for duplicate videos...');
      setLoadingStep(1);
      setProgress(10);
      
      // 1. check-duplicate API로 이름 중복 먼저 확인
      // try {
      //   console.log('중복 체크 요청 filename:', file.name);
      //   const checkRes = await axios.post('http://172.17.174.197:8000/api/check-duplicate/', { filename: file.name });
      //   if (checkRes.data && checkRes.data.is_duplicate) {
      //     setLoadingMessage('Loading existing analysis results...');
      //     setIsLoading(false);
      //     navigate('/edit', {
      //       state: {
      //         videoSrc: null,
      //         fileId: checkRes.data.file_id,
      //         aiHighlights: checkRes.data.highlights,
      //         subtitleFiles: checkRes.data.subtitle_files
      //       }
      //     });
      //     return;
      //   }
      // } catch (e) {
      //   console.error('중복 체크 오류:', e);
      // }
      
      // Step 2: Uploading video
      setLoadingMessage('Uploading video to server...');
      setLoadingStep(2);
      setProgress(25);
      
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://172.17.174.197:8000/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Step 3: AI is analyzing
        setLoadingMessage('AI is analyzing video content...');
        setLoadingStep(3);
        setProgress(50);
        
        // Step 4: Detecting highlights
        setLoadingMessage('Detecting highlights and events...');
        setLoadingStep(4);
        setProgress(70);
        
        console.log('업로드 응답 데이터:', {
          file_id: response.data.file_id,
          highlights: response.data.highlights,
          message: response.data.message
        });
        
        // Step 5: Generating subtitles
        setLoadingMessage('Generating subtitles...');
        setLoadingStep(5);
        setProgress(85);
        
        let subtitleFiles = null;
        try {
          const subtitleRes = await axios.post('http://172.17.174.197:8000/api/generate-subtitle/', {
            file_id: response.data.file_id
          });
          subtitleFiles = subtitleRes.data.subtitle_files;
        } catch (subtitleErr) {
          console.error('Subtitle generation failed:', subtitleErr);
        }
        
        // Step 6: Finalizing
        setLoadingMessage('Finalizing analysis...');
        setLoadingStep(6);
        setProgress(100);
        
        // Small delay to show completion
        setTimeout(() => {
          setIsLoading(false);
          setLoadingMessage('');
          console.log('Upload successful:', response.data);
          navigate('/edit', { 
            state: { 
              videoSrc: url, 
              fileId: response.data.file_id, 
              aiHighlights: response.data.highlights,
              customHighlights: response.data.custom_highlights || [],
              deletedHighlightIds: response.data.deleted_highlight_ids || [],
              subtitleFiles 
            } 
          });
        }, 1000);
        
      } catch (error) {
        setIsLoading(false);
        setLoadingMessage('Error occurred during processing!');
        console.error('Error uploading video:', error);
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-input').click();
  };

  const loadingSteps = [
    { icon: <VideoIcon />, text: "Checking for duplicate videos..." },
    { icon: <UploadIcon />, text: "Uploading video to server..." },
    { icon: <AIIcon />, text: "AI is analyzing video content..." },
    { icon: <MagicIcon />, text: "Detecting highlights and events..." },
    { icon: <EditIcon />, text: "Generating subtitles..." },
    { icon: <AIIcon />, text: "Finalizing analysis..." }
  ];

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Sports Editor
          </Typography>
        </Toolbar>
      </AppBar>
      
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!isLoading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            boxShadow: 4,
            borderRadius: 4,
            bgcolor: 'white',
            p: { xs: 3, md: 6 },
            maxWidth: 900,
            width: '100%',
            gap: 6
          }}>
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                AI Sports Video Editor
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Upload your sports videos and let our AI extract the highlights.<br />
                Edit and customize your video with ease.
              </Typography>
              <input
                type="file"
                id="file-input"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<UploadIcon />}
                onClick={triggerFileInput}
                sx={{ borderRadius: 3, boxShadow: 2, px: 4, py: 1.5 }}
                disabled={isLoading}
              >
                Upload Video
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <img
                src="/draganddrop.jpg"
                alt="AI Video Editing"
                style={{ width: '100%', maxWidth: 340, borderRadius: 16, boxShadow: '0 8px 32px #0001' }}
              />
            </Box>
          </Box>
        ) : (
          <Fade in={isLoading} timeout={500}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 4,
              borderRadius: 4,
              bgcolor: 'white',
              p: { xs: 4, md: 6 },
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}>
              {/* AI Icon with Animation */}
              <Zoom in={true} timeout={800}>
                <Box sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}>
                  <AIIcon sx={{ fontSize: 48 }} />
                </Box>
              </Zoom>

              {/* Main Title */}
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                AI is Working
              </Typography>
              
              {/* Current Step */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                {loadingSteps[loadingStep - 1]?.icon && (
                  <Zoom in={true} timeout={600}>
                    <Box sx={{ color: 'primary.main' }}>
                      {loadingSteps[loadingStep - 1].icon}
                    </Box>
                  </Zoom>
                )}
                <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
                  {loadingMessage}
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ width: '100%', mb: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                    }
                  }} 
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {progress}% Complete
                </Typography>
              </Box>

              {/* Step Indicators */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {loadingSteps.map((step, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: index < loadingStep ? 'primary.main' : 'grey.300',
                      transition: 'all 0.3s ease',
                      transform: index === loadingStep - 1 ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </Box>

              {/* Subtitle */}
              <Typography variant="body2" color="text.secondary">
                Please wait while our AI analyzes your video and extracts highlights...
              </Typography>
            </Box>
          </Fade>
        )}
      </main>
    </>
  );
}

export default MainPage;