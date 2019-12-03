import c from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../Button';
import useStyles from './styles';


/**
 * Render a list of actions.
 *
 * Usually these can take the form of a button list at the bottom of a paper component,
 * or at the top-right of a card component.
 */
export default function Actions({ actions, className }) {
  const classes = useStyles();
  return !!actions.length && (
    <div className={c('dydu-actions', classes.root, className)}>
      {actions.map(({ action, text, type, ...rest }, index) => (
        <Button children={text} key={index} onClick={action} type={type || 'button'} {...rest} />
      ))}
    </div>
  );
}


Actions.defaultProps = {
  actions: [],
};


Actions.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.func,
    text: PropTypes.string.isRequired,
    type: PropTypes.string,
  })),
  className: PropTypes.string,
};
