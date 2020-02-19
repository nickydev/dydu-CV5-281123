import { createUseStyles } from 'react-jss';


export default createUseStyles(theme => {

  const side = {
    borderRadius: theme.shape.radius.outer,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
      left: 0,
      marginRight: 'unset',
      right: 0,
      width: 'unset !important',
    },
  };

  return {
    actions: () => ({
      display: 'flex',
      marginLeft: 'auto',
      '& > :not(:first-child)': {
        marginLeft: '1em',
      },
    }),
    base: ({ configuration }) => ({
      backgroundColor: theme.palette.background.secondary,
      overflowY: 'auto',
      ...configuration.secondary.styles,
      [theme.breakpoints.down('xs')]: configuration.secondary.stylesMobile,
    }),
    body: () => ({
      padding: '1.6em',
      paddingTop: 0,
    }),
    frame: () => ({
      border: 0,
      flexGrow: 1,
    }),
    header: () => ({
      backgroundColor: `${theme.palette.background.secondary}CC`,
      display: 'flex',
      padding: '1.6em',
      position: 'sticky',
      top: 0,
    }),
    left: () => ({
      ...side,
      right: '100%',
      marginRight: '.5em',
    }),
    over: () => ({
      boxShadow: 'none',
      width: 'unset',
    }),
    right: () => ({
      ...side,
      left: '100%',
      marginLeft: '.5em',
    }),
    title: () => ({
      margin: 0,
      marginRight: '1em',
    }),
  };
});
