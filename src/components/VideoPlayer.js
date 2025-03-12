import React, { useRef, useState } from 'react';
import { Button, Slider, Grid } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (event, newValue) => {
    videoRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ width: '100%' }}
      />
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <Button onClick={handlePlayPause}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </Button>
        </Grid>
        <Grid item xs>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleSeek}
            aria-labelledby="continuous-slider"
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default VideoPlayer;