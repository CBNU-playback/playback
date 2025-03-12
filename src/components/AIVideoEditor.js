import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Grid,
  Button,
  Box
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      
      // 비디오 파일을 백엔드로 업로드
      const formData = new FormData();
      formData.append('file', file);  // 'file' 키를 사용하여 파일 추가

      try {
        const response = await axios.post('http://localhost:8000/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Upload successful:', response.data);  // 업로드 성공 메시지 출력

        navigate('/edit', { state: { videoSrc: url, fileId: response.data.file_id } });  // fileId를 상태로 전달
      } catch (error) {
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
      
      <main className={classes.main}>
        <section className={classes.section}>
          <Container className={classes.content}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" gutterBottom>
                  AI Sports Video Editor
                </Typography>
                <Typography variant="body1" paragraph>
                  Upload your sports videos and let our AI extract the highlights. Edit and customize your video with ease.
                </Typography>
                <input
                  type="file"
                  id="file-input"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<UploadIcon />}
                    onClick={triggerFileInput}
                  >
                    Upload Video
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <img 
                  src="/draganddrop.jpg"  // public 폴더의 이미지를 참조할 때는 '/' 로 시작
                  alt="AI Video Editing" 
                  className={classes.heroImage}
                />
              </Grid>
            </Grid>
          </Container>
        </section>
      </main>
    </>
  );
}

export default MainPage;
