import c from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import { DialogContext, DialogProvider } from '../../contexts/DialogContext';
import { ModalContext, ModalProvider } from '../../contexts/ModalContext';
import { OnboardingContext, OnboardingProvider } from '../../contexts/OnboardingContext';
import { TabProvider } from '../../contexts/TabContext';
import dydu from '../../tools/dydu';
import { LOREM_HTML, LOREM_HTML_SPLIT } from '../../tools/lorem';
import { Cookie } from '../../tools/storage';
import talk from '../../tools/talk';
import Contacts from '../Contacts';
import Dialog from '../Dialog';
import Dragon from '../Dragon';
import Footer from '../Footer';
import Gdpr from '../Gdpr';
import GdprDisclaimer from '../GdprDisclaimer';
import Header from '../Header';
import Modal from '../Modal';
import Onboarding from '../Onboarding';
import Secondary from '../Secondary';
import Tab from '../Tab';
import useStyles from './styles';


/**
 * Root component of the chatbox. It implements the `window` API as well.
 */
export default function Chatbox({ open, root, toggle, ...rest}) {

  const { configuration } = useContext(ConfigurationContext);
  const {
    add,
    addRequest,
    addResponse,
    empty,
    interactions,
    secondaryActive,
    setSecondary,
    toggleSecondary,
  } = useContext(DialogContext);
  const { active: onboardingActive } = useContext(OnboardingContext);
  const { modal } = useContext(ModalContext);
  const [ gdprShowDisclaimer, setGdprShowDisclaimer ] = useState(false);
  const [ gdprPassed, setGdprPassed ] = useState(false);
  const classes = useStyles({configuration});
  const [ t, i ] = useTranslation();
  const qualification = !!configuration.application.qualification;
  const secondaryMode = configuration.secondary.mode;

  const ask = useCallback((text, options) => {
    text = text.trim();
    if (text) {
      options = Object.assign({hide: false}, options);
      if (!options.hide) {
        addRequest(text);
      }
      talk(text, {qualification}).then(addResponse);
    }
  }, [addRequest, addResponse, qualification]);

  useEffect(() => {
    if (!window.dydu) {
      window.dydu = {};

      window.dydu.chat = {
        ask: (text, options) => ask(text, options),
        empty: () => empty(),
        reply: text => addResponse({text}),
        set: (name, value) => dydu.variable(name, value),
      };

      window.dydu.gdpr = () => modal(Gdpr, ({ email, method }) => dydu.gdpr({email, method}).then(
        () => window.dydu.chat.reply(t('gdpr:get.success')),
        () => window.dydu.chat.reply(t('gdpr:get.error')),
      )).then(() => {}, () => {});

      window.dydu.localization = {
        get: () => dydu.getLocale(),
        set: locale => Promise.all([dydu.setLocale(locale), i.changeLanguage(locale)]).then(
          ([ locale ]) => window.dydu.chat.reply(`New locale set: '${locale}'.`),
          response => window.dydu.chat.reply(response),
        ),
      };

      window.dydu.lorem = {
        standard: () => window.dydu.chat.reply(LOREM_HTML),
        split: () => window.dydu.chat.reply(LOREM_HTML_SPLIT),
      };

      window.dydu.space = {
        get: () => dydu.getSpace(),
        set: (space, { quiet } = {}) => dydu.setSpace(space).then(
          space => !quiet && window.dydu.chat.reply(`New space set: '${space}'.`),
          () => {},
        ),
      };

      window.dydu.ui = {
        secondary: (open, { body, title }) => {
          setSecondary({body, title});
          toggleSecondary(open)();
        },
        toggle: mode => toggle(mode)(),
      };

      window.reword = window.dydu.chat.ask;
    }
  }, [addResponse, ask, empty, i, modal, setSecondary, t, toggle, toggleSecondary]);

  useEffect(() => {
    if (gdprShowDisclaimer) {
      setGdprShowDisclaimer(false);
      modal(GdprDisclaimer, null, {dismissable: false}).then(
        () => {
          Cookie.set(Cookie.names.gdpr, undefined, Cookie.duration.long);
          setGdprPassed(true);
        },
        () => {
          setGdprShowDisclaimer(true);
          toggle(1)();
        },
      );
    }
  }, [gdprShowDisclaimer, modal, toggle]);

  useEffect(() => {
    if (!Cookie.get(Cookie.names.gdpr)) {
      setGdprShowDisclaimer(true);
    }
    else {
      setGdprPassed(true);
    }
  }, []);

  return (
    <TabProvider>
      <div className={c('dydu-chatbox', classes.root, {[classes.rootHidden]: !open})}
           ref={root}
           {...rest}>
        {gdprPassed && (
          <Onboarding render>
            <div className={c(
              'dydu-chatbox-body',
              classes.body,
              {[classes.bodyHidden]: secondaryActive && secondaryMode === 'over'},
            )}>
              <Tab component={Dialog} interactions={interactions} onAdd={add} render value="dialog" />
              <Tab component={Contacts} value="contacts" />
            </div>
            {secondaryMode === 'over' && <Secondary />}
            <Footer onRequest={addRequest} onResponse={addResponse} />
          </Onboarding>
        )}
        <Modal />
        <Header flat={onboardingActive} onClose={toggle(1)} style={{order: -1}} />
        {secondaryMode !== 'over' && <Secondary anchor={root} />}
      </div>
    </TabProvider>
  );
}


Chatbox.propTypes = {
  open: PropTypes.bool.isRequired,
  root: PropTypes.shape({current: PropTypes.instanceOf(Element)}),
  toggle: PropTypes.func.isRequired,
};


export function ChatboxWrapper(rest) {
  return (
    <DialogProvider>
      <OnboardingProvider>
        <ModalProvider>
          <Dragon component={Chatbox} {...rest} />
        </ModalProvider>
      </OnboardingProvider>
    </DialogProvider>
  );
}
