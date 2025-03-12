import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container } from '@material-ui/core';
import VideoPlayer from '../components/VideoPlayer';
import { fetchVideo } from '../api/videoApi';

function Player() {
  const [video, setVideo] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideo(id);
        setVideo(data);
      } catch (error) {
        console.error('Failed to load video:', error);
      }
    };
    loadVideo();
  }, [id]);

  if (!video) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        {video.title}
      </Typography>
      <VideoPlayer src={video.url} />
    </Container>
  );
}

export default Player;