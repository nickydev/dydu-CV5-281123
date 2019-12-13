import c from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Progress from '../Progress';
import useStyles from './styles';


/**
 * Wrap children with a paper-like UI.
 *
 * See Material design: https://material.io/.
 */
export default function Paper({ actions, children, className, component, thinking, title, ...rest }) {
  const classes = useStyles();
  return React.createElement(component, {className: c('dydu-paper', classes.root, className), ...rest}, (
    <>
      {thinking && <Progress className={classes.progress} />}
      {title && <h3 children={title} className={c('dydu-paper-header', classes.header)} />}
      {children && <div children={children} className="dydu-paper-body" />}
      {actions && <div children={actions} className={c('dydu-paper-actions', classes.actions)} />}
    </>
  ));
}


Paper.defaultProps = {
  actions: [],
  component: 'div',
};


Paper.propTypes = {
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  component: PropTypes.elementType,
  thinking: PropTypes.bool,
  title: PropTypes.string,
};
