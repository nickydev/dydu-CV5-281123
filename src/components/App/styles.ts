import { createUseStyles } from 'react-jss';

export default createUseStyles<any, any>((theme: any): any => ({
  background: () => ({
    position: 'absolute',
  }),
  iframe: () => ({
    '& .dydu-actions': {
      '& button:first-child': {
        display: 'none',
      },
      marginLeft: '10px',
      marginTop: 0,
    },
    '& :first-child': {
      flexGrow: 1,
    },
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '15px',
  }),
  root: () => ({
    '& *': {
      boxSizing: 'border-box',
    },
    '& iframe': {
      maxWidth: '100%',
    },
    '& img': {
      display: 'block',
      maxWidth: '100%',
    },
    '& p > img': {
      display: 'inline-block',
      maxWidth: '100%',
    },
    fontFamily: theme.font?.sansSerif,
    fontSize: 'initial',
    textAlign: 'initial',
    lineHeight: 'initial',
    fontWeight: 'initial',
    color: 'initial',
  }),
  cookiesDisclaimerRoot: () => ({
    fontSize: '16px',
    fontWeight: 'normal',
    marginRight: '5px',
    marginBottom: '5px',
  }),
  cookiesDisclaimerTitle: () => ({
    fontSize: '18px',
    minWidth: '6.7em',
    maxWidth: '30em',
    padding: '.5em .5em',
    margin: 0,
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: theme.shape.radius.outer,
    borderTopRightRadius: theme.shape.radius.outer,
    boxShadow: theme.shadows[1],
    color: theme.palette.primary.text,
    [theme.breakpoints?.down('xs')]: {
      borderRadius: 0,
    },
    zIndex: 1,
  }),
  cookiesDisclaimerContent: () => ({
    minWidth: '6.7em',
    maxWidth: '30em',
    padding: '.5em .5em',
    margin: 0,
    width: '100%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[1],
    color: 'black',
    [theme.breakpoints?.down('xs')]: {
      borderRadius: 0,
    },
    zIndex: 1,
  }),
  cookiesDisclaimerActions: {
    '& > :not(:last-child)': {
      marginRight: '.5em',
    },
    margin: '0 1em 1em 1em',
    height: 35,
    '& $button': {
      width: '50%',
      justifyContent: 'center',
    },
  },
}));
