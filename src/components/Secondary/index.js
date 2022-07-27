import c from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import { DialogContext } from '../../contexts/DialogContext';
import Button from '../Button';
import PrettyHtml from '../PrettyHtml';
import useStyles from './styles';
import { isDefined } from '../../tools/helpers';

/**
 * Render secondary content. The content can be modal and blocking for the rest
 * of the chatbox by being placed over the conversation or less intrusive on a
 * side of the chatbox.
 */
export default function Secondary({ anchor, mode }) {
  const { configuration } = useContext(ConfigurationContext);
  const { secondaryActive, secondaryContent, toggleSecondary } = useContext(DialogContext);
  const root = useRef(null);
  const [initialMode, setMode] = useState(configuration.secondary.mode);
  mode = mode || initialMode;
  const { bodyRenderer, body, height, title, url, width } = secondaryContent || {};
  const classes = useStyles({ configuration, height, width });
  const { boundaries } = configuration.dragon;

  if (boundaries && (mode === 'left' || mode === 'right') && anchor && anchor.current && root.current) {
    let { left: anchorLeft, right: anchorRight } = anchor.current.getBoundingClientRect();
    anchorRight = window.innerWidth - anchorRight;
    let { left, right, width } = root.current.getBoundingClientRect();
    right = window.innerWidth - right;
    if (left < 0 && mode !== 'right' && anchorRight > width) {
      setMode('right');
    } else if (right < 0 && mode !== 'left' && anchorLeft > width) {
      setMode('left');
    }
  }

  const renderBody = useCallback(() => {
    console.log('rendering body !', bodyRenderer);
    if (isDefined(bodyRenderer)) return bodyRenderer();
    console.log('rendery pretty html');
    return <PrettyHtml className={c('dydu-secondary-body', classes.body)} html={body} />;
  }, [body, bodyRenderer, classes.body]);

  return secondaryActive ? (
    <div className={c('dydu-secondary', `dydu-secondary-${mode}`, classes.base, classes[mode])} ref={root}>
      <div className={c('dydu-secondary-header', classes.header)}>
        {title && <h1 children={title} className={c('dydu-secondary-title', classes.title)} />}
        <div className={c('dydu-secondary-actions', classes.actions)}>
          <Button color="primary" onClick={toggleSecondary(false)} type="button" variant="icon">
            <img alt="Close" src={`${process.env.PUBLIC_URL}icons/dydu-close-white.svg`} title="Close" />
          </Button>
        </div>
      </div>
      {renderBody()}
      {/*body && <PrettyHtml className={c('dydu-secondary-body', classes.body)} html={body} />*/}
      {url && (
        <iframe
          allow="fullscreen"
          className={classes.frame}
          importance="low"
          sandbox="allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-forms"
          src={url}
          title={url}
        />
      )}
    </div>
  ) : null;
}

Secondary.propTypes = {
  anchor: PropTypes.object,
  mode: PropTypes.string,
};
