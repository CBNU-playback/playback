import React from 'react';
import { Typography, Container } from '@material-ui/core';

function NotFound() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h2" component="h1" gutterBottom>
        404: Page Not Found
      </Typography>
    </Container>
  );
}

export default NotFound;