import { createUseStyles } from 'react-jss';

export default createUseStyles((theme) => ({
  root: () => ({
    '& > :not(:last-child)': {
      borderBottomWidth: 1,
    },
    backgroundColor: theme.palette.background.menu,
    borderRadius: theme.shape.radius.inner,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.primary,
    fontFamily: theme.font.sansSerif,
    overflowY: 'auto',
    position: 'fixed',
    visibility: 'hidden',
    zIndex: '99',
  }),
}));
