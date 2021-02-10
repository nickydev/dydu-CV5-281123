import { createUseStyles } from 'react-jss';


export default createUseStyles(theme => ({
  root: () => ({
    '& *' : {
      boxSizing : 'border-box',
    },
    '& iframe' : {
      maxWidth: '100%',
    },
    '& img' : {
      display:'block',
      maxWidth: '100%'
    },
    fontFamily: theme.font.sansSerif,
  }),
}));
