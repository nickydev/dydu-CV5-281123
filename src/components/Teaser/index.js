import { useCallback, useContext, useState } from 'react';

import Actions from '../Actions/Actions';
import { DialogContext } from '../../contexts/DialogContext';
import Draggable from 'react-draggable';
import { EventsContext } from '../../contexts/EventsContext';
import { Local } from '../../tools/storage';
import PropTypes from 'prop-types';
import Skeleton from '../Skeleton';
import { UserActionContext } from '../../contexts/UserActionContext';
import Voice from '../../modulesApi/VoiceModuleApi';
import c from 'classnames';
import { useConfiguration } from '../../contexts/ConfigurationContext';
import useStyles from './styles';
import { useTranslation } from 'react-i18next';

const TEASER_TYPES = {
  AVATAR_AND_TEXT: 0,
  AVATAR_ONLY: 1,
  TEXT_ONLY: 2,
};

/**
 * Minified version of the chatbox.
 */
export default function Teaser({ open, toggle }) {
  const { configuration } = useConfiguration();
  const event = useContext(EventsContext).onEvent('teaser');
  const classes = useStyles({ configuration });
  const { ready, t } = useTranslation('translation');
  const { tabbing } = useContext(UserActionContext) || false;
  const { enable: disclaimerEnable } = configuration.gdprDisclaimer;

  const title = t('teaser.title');
  const titleHidden = t('teaser.titleHidden');
  const mouseover = t('teaser.mouseover');

  const teaserAvatar = configuration.avatar?.teaser?.image || configuration.avatar?.response?.image;
  const teaserAvatarBackground = configuration.avatar?.teaser?.background;

  const logoTeaser = teaserAvatar?.includes('base64')
    ? teaserAvatar
    : `${process.env.PUBLIC_URL}assets/${teaserAvatar}`;

  const voice = configuration.Voice ? configuration.Voice.enable : false;
  const [isCommandHandled, setIsCommandHandled] = useState(null);
  const [buttonPressTimer, setButtonPressTimer] = useState(null);

  // DISPLAY TEASER TYPE
  const { AVATAR_AND_TEXT, AVATAR_ONLY, TEXT_ONLY } = TEASER_TYPES;
  const initialTeaserType =
    !configuration.teaser.displayType ||
    configuration.teaser.displayType > TEXT_ONLY ||
    configuration.teaser.displayType < AVATAR_AND_TEXT
      ? AVATAR_AND_TEXT
      : configuration.teaser.displayType;

  const openChatboxOnClickOrTouch = useCallback(() => {
    event('onClick');
    toggle(2)();
  }, [event, toggle]);

  const handleButtonPress = useCallback(
    (e) => {
      if (buttonPressTimer) clearTimeout(buttonPressTimer);

      setButtonPressTimer(setTimeout(handleLongPress, 250, e));

      setIsCommandHandled(false);
    },
    [buttonPressTimer, handleLongPress],
  );

  const handleLongPress = useCallback(() => {
    setIsCommandHandled(true);
  }, []);

  const handleButtonRelease = useCallback(() => {
    if (!isCommandHandled) {
      openChatboxOnClickOrTouch();
      //isCommandHandled isn't updated here, as a result logic is executed always
      // got regular click, not long press
      setIsCommandHandled(true);
    }

    clearTimeout(buttonPressTimer);
  }, [buttonPressTimer, isCommandHandled, openChatboxOnClickOrTouch]);

  const onKeyDown = (event) => {
    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault();
      openChatboxOnClickOrTouch();
    }
  };

  return (
    <Draggable bounds="html">
      <div
        className={c('dydu-teaser', classes.root, { [classes.hidden]: !open })}
        id="dydu-teaser"
        aria-labelledby="teaser-chatbot"
      >
        <div className={c('dydu-teaser-container', classes.dyduTeaserContainer)} id="teaser-chatbot">
          <div
            onMouseDown={handleButtonPress}
            onMouseUp={handleButtonRelease}
            onKeyDown={onKeyDown}
            onTouchStart={handleButtonPress}
            onTouchEnd={handleButtonRelease}
            title={mouseover}
            role="button"
            tabIndex="0"
            aria-pressed={!open}
            className={c('dydu-teaser-title', classes.dyduTeaserTitle, {
              [classes.hideOutline]: !tabbing,
            })}
          >
            {(initialTeaserType === AVATAR_AND_TEXT || initialTeaserType === TEXT_ONLY) && (
              <div className={c('dydu-teaser-button', classes.button)}>
                <Skeleton children={title} hide={!ready} width="3em" />
              </div>
            )}
            {(initialTeaserType === AVATAR_AND_TEXT || initialTeaserType === AVATAR_ONLY) && (
              <div
                className={c('dydu-teaser-brand', classes.brand, teaserAvatarBackground && classes.backgroundAvatar)}
              >
                <h1>{titleHidden}</h1>
                <img onKeyDown={onKeyDown} alt="" src={logoTeaser} />
              </div>
            )}
          </div>
          {open && voice && disclaimerEnable && (
            <Voice
              DialogContext={DialogContext}
              configuration={configuration}
              Actions={Actions}
              show={!!Local.get(Local.names.gdpr)}
              t={t('input.actions.record')}
            />
          )}
        </div>
      </div>
    </Draggable>
  );
}

Teaser.propTypes = {
  open: PropTypes.bool,
  toggle: PropTypes.func,
};
