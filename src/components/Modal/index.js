import c from 'classnames';
import React, { useContext } from 'react';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import { ModalContext } from '../../contexts/ModalContext';
import Paper from '../Paper';
import useStyles from './styles';


/**
 * Dock for child content to be displayed within modal UI.
 *
 * The modal comes with an backdrop overlay that self-dismiss on click.
 */
export default function Modal() {

  const { configuration } = useContext(ConfigurationContext);
  const { Component, onReject, onResolve, thinking } = useContext(ModalContext);
  const classes = useStyles({configuration});

  const onClick = event => {
    event.stopPropagation();
  };

  return !!Component && (
    <div className={c('dydu-modal-overlay', classes.root)} onClick={onReject}>
      <Component className={c('dydu-modal', classes.modal)}
                 component={Paper}
                 onClick={onClick}
                 onReject={onReject}
                 onResolve={onResolve}
                 thinking={thinking} />
    </div>
  );
}
