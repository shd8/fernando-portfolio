import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { MuiThemeProvider, useMediaQuery, CssBaseline } from '@material-ui/core';
import { darkTheme, lightTheme } from '../src/theme';

export default function MyApp({ Component, pageProps }) {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [theme, setTheme] = useState(
    prefersDarkMode ? darkTheme : lightTheme
  )

  useEffect(() => {
    setTheme(prefersDarkMode ? darkTheme : lightTheme)
  }, [prefersDarkMode])

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Fernando Gomez Graciani</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} setTheme={setTheme}/>
      </MuiThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

console.log(`%c
______________    __/\\\\\\_________    _________/\\\\\\__    _____/\\\\\\\\\\\\\\\\\\____
 ______________    _\\/\\\\\\_________    ________\\/\\\\\\__    ___/\\\\\\///////\\\\\\__       
  ______________    _\\/\\\\\\_________    ________\\/\\\\\\__    __\\/\\\\\\_____\\/\\\\\\__      
   __/\\\\\\\\\\\\\\\\\\\\\_    _\\/\\\\\\_________    ________\\/\\\\\\__    __\\///\\\\\\\\\\\\\\\\\\/___     
    _\\/\\\\\\//////__    _\\/\\\\\\\\\\\\\\\\\\\\__     ___/\\\\\\\\\\\\\\\\\\__   ___/\\\\\\///////\\\\\\__    
     _\\/\\\\\\\\\\\\\\\\\\\\_    _\\/\\\\\\/////\\\\\\_    __/\\\\\\////\\\\\\__    __/\\\\\\______\\//\\\\\\_   
      _\\////////\\\\\\_    _\\/\\\\\\___\\/\\\\\\_    _\\/\\\\\\__\\/\\\\\\__    _\\//\\\\\\______/\\\\\\__  
       __/\\\\\\\\\\\\\\\\\\\\_    _\\/\\\\\\___\\/\\\\\\_    _\\//\\\\\\\\\\\\\\/\\\\_    __\\///\\\\\\\\\\\\\\\\\\/___ 
        _\\//////////__    _\\///____\\///__     _\\///////\\//__    ____\\/////////_____


  shd8 Copyright © - https://github.com/shd8

`, "color: green")