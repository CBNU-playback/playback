import React from 'react';
import { AppBar, Toolbar, Typography, Button, InputBase, Avatar } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    height: 56,
  },
  title: {
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
  },
  nav: {
    display: 'flex',
  },
  navLink: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(3),
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[200],
    marginLeft: 'auto',
    width: '200px',
  }
}));

function CommonHeader() {
  const classes = useStyles();
  
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} className={classes.header}>
      <Toolbar className={classes.headerContent}>
        <Typography variant="h6" className={classes.title}>
          AI Sports Editor
        </Typography>
        <nav className={classes.nav}>
          <Link to="/" className={classes.navLink}>
            Home
          </Link>
          <Link to="/edit" className={classes.navLink}>
            Editor
          </Link>
          <Link to="/help" className={classes.navLink}>
            Help
          </Link>
        </nav>
        <div className={classes.search}>
          <SearchIcon />
          <InputBase placeholder="Search..." />
        </div>
        <Button onClick={handleLogout} color="secondary">Logout</Button>
        <Avatar sx={{ ml: 2 }} />
      </Toolbar>
    </AppBar>
  );
}

export default CommonHeader; 