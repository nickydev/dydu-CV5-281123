import { createUseStyles } from 'react-jss';


export default createUseStyles( theme => ({
    email : {
        '& > div': {
            '& > div': {
                '& > div': {
                    '& > div': {
                        '& > div': {
                            '& > div': {
                                marginBottom: '.5em'
                            },
                            flexDirection: 'column',
                        }
                    }
                }
            }
        }
    },
    field: {
        '&:not(:last-child)': {
          marginBottom: '1em',
        },
        display: 'block',
    },
    input: {
        '&:not(:first-child)': {
          marginTop: '.5em',
        },
        backgroundColor: theme.palette.primary.light,
        border: 0,
        borderRadius: theme.shape.radius.inner,
        boxSizing: 'border-box',
        display: 'block',
        fontFamily: theme.font.monospace,
        margin: 0,
        padding: '.6em',
        width: '100%',
      },
}));
