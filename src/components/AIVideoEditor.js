import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Grid,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { CloudUpload as UploadIcon, Edit as EditIcon } from '@mui/icons-material';
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      setLoadingMessage('영상 업로드 및 분석 중...');
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      
      // 비디오 파일을 백엔드로 업로드
      const formData = new FormData();
      formData.append('file', file);  // 'file' 키를 사용하여 파일 추가

      try {
        const response = await axios.post('http://172.17.174.197:8000/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setIsLoading(false);
        setLoadingMessage('');
        console.log('Upload successful:', response.data);  // 업로드 성공 메시지 출력

        navigate('/edit', { state: { videoSrc: url, fileId: response.data.file_id, aiHighlights: response.data.highlights } });
      } catch (error) {
        setIsLoading(false);
        setLoadingMessage('오류 발생!');
        console.error('Error uploading video:', error);
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-input').click();
  };

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
            {isLoading && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={28} color="primary" />
                <Typography variant="body2" color="primary" sx={{ ml: 2, display: 'inline' }}>
                  {loadingMessage}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/draganddrop.jpg"
              alt="AI Video Editing"
              style={{ width: '100%', maxWidth: 340, borderRadius: 16, boxShadow: '0 8px 32px #0001' }}
            />
          </Box>
        </Box>
      </main>
    </>
  );
}

export default MainPage;