import { EventsContext, useEvent } from '../../contexts/EventsContext';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import Actions from '../Actions';
import Autosuggest from 'react-autosuggest';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import { DialogContext } from '../../contexts/DialogContext';
import { Local } from '../../tools/storage';
import PropTypes from 'prop-types';
import Voice from '../../modulesApi/VoiceModuleApi';
import c from 'classnames';
import dydu from '../../tools/dydu';
import talk from '../../tools/talk';
import useDebounce from '../../tools/hooks/debounce';
import { useLivechat } from '../../contexts/LivechatContext';
import useStyles from './styles';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line no-unused-vars

/**
 * Wrapper around the input bar to contain the talk and suggest logic.
 */
export default function Input({ onRequest, onResponse }) {
  const { isLivechatOn, send, typing: livechatTyping } = useLivechat();
  const { configuration } = useContext(ConfigurationContext);
  const event = useContext(EventsContext).onEvent('chatbox');
  const { disabled, locked, placeholder, qualification } = useContext(DialogContext);

  const classes = useStyles({ configuration });
  const [counter = 100, setCounter] = useState(configuration.input.maxLength);
  const [input, setInput] = useState('');
  const { prompt } = useContext(DialogContext);
  const [suggestions, setSuggestions] = useState([]);
  const [typing, setTyping] = useState(false);
  const { ready, t } = useTranslation('translation');
  const actionSend = t('input.actions.send');
  const { counter: showCounter, delay, maxLength = 100 } = configuration.input;
  const { limit: suggestionsLimit = 3 } = configuration.suggestions;
  const debouncedInput = useDebounce(input, delay);
  const inputRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [increment, setIncrement] = useState();
  const { event: chatbotEvent } = useEvent();

  const voice = configuration.Voice ? configuration.Voice.enable : false;

  let incrementToUpdateRefOnRender = 0;

  useEffect(() => {
    if (chatbotEvent === 'teaser/onClick') {
      inputRef && inputRef?.current?.focus();
    }
    setIncrement(incrementToUpdateRefOnRender++);
  }, [chatbotEvent, incrementToUpdateRefOnRender, inputRef]);

  useEffect(() => {
    Local.viewQualification.save(qualification);
  }, [qualification]);

  const onChange = (event) => {
    setTyping(true);
    setInput(event.target.value);
    setCounter(maxLength - event.target.value.length);
  };

  const onKeyDown = (event) => {
    if (event.keyCode === 13 && !event.defaultPrevented) {
      event.preventDefault();
      submit(input);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    submit(input);
  };

  useEffect(() => {
    if (isLivechatOn && typing) livechatTyping(input);
  }, [input, isLivechatOn, livechatTyping, typing]);

  const onSuggestionSelected = (event, { suggestionValue }) => {
    event.preventDefault();
    setTyping(false);
    setInput(suggestionValue);
    submit(suggestionValue);
  };

  const renderInputComponent = useCallback(
    (properties) => {
      const data = {
        ...properties,
      };

      return (
        <div className={c('dydu-input-field', classes.field)}>
          <textarea {...data} disabled={prompt || locked} />
          <div children={input} className={classes.fieldShadow} />
          {!!showCounter && <span children={counter} className={classes.counter} />}
        </div>
      );
    },
    [classes.counter, classes.field, classes.fieldShadow, counter, input, locked, prompt, showCounter],
  );

  const reset = useCallback(() => {
    setCounter(configuration.input.maxLength);
    setInput('');
  }, [configuration.input.maxLength]);

  const sendInput = useCallback(
    (input) => {
      if (isLivechatOn) send(input);
      else {
        talk(input, { qualification }).then(onResponse);
        console.log('🚀 ~ file: index.js ~ line 114 ~ Input ~ qualification', qualification);
      }
    },
    // eslint-disable-next-line
    [isLivechatOn, send, qualification],
  );

  const submit = useCallback(
    (text) => {
      text = text.trim();
      if (text) {
        reset();
        onRequest(text);
        event('questionSent', text);
        sendInput(text);
      }
      setTyping(false);
    },
    [event, onRequest, reset, sendInput, qualification],
  );

  const suggest = useCallback(
    (text) => {
      text = text.trim();
      if (text && suggestionsLimit > 0) {
        dydu.suggest(text).then((suggestions) => {
          suggestions = Array.isArray(suggestions) ? suggestions : [suggestions];
          setSuggestions(suggestions.slice(0, suggestionsLimit));
        });
      }
    },
    [suggestionsLimit],
  );

  useEffect(() => {
    if (typing) {
      suggest(debouncedInput);
    }
  }, [debouncedInput, suggest, typing]);

  const theme = {
    container: c('dydu-input-container', classes.container),
    input: c('dydu-input-field-text', classes.fieldText),
    suggestion: c('dydu-suggestions-candidate', classes.suggestionsCandidate),
    suggestionHighlighted: c('dydu-suggestions-selected', classes.suggestionsSelected),
    suggestionsContainer: c('dydu-suggestions', classes.suggestions),
    suggestionsList: c('dydu-suggestions-list', classes.suggestionsList),
  };

  const inputProps = {
    ref: inputRef,
    disabled,
    maxLength,
    onChange,
    onKeyDown,
    placeholder: ((ready && placeholder) || t('input.placeholder')).slice(0, 50),
    value: input,
  };

  const actions = [
    {
      children: (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="#7091D8"
            d="M9.78,18.65L10.06,14.42L17.74,7.5C18.08,7.19 17.67,7.04 17.22,7.31L7.74,13.3L3.64,12C2.76,11.75 2.75,11.14 3.84,10.7L19.81,4.54C20.54,4.21 21.24,4.72 20.96,5.84L18.24,18.65C18.05,19.56 17.5,19.78 16.74,19.36L12.6,16.3L10.61,18.23C10.38,18.46 10.19,18.65 9.78,18.65Z"
          />
        </svg>
      ),
      type: 'submit',
      variant: 'icon',
      title: actionSend,
    },
  ];

  return (
    <form className={c('dydu-input', classes.root)} onSubmit={onSubmit}>
      <Autosuggest
        getSuggestionValue={(suggestion) => suggestion.rootConditionReword || ''}
        inputProps={inputProps}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestionsClearRequested={() => setSuggestions([])}
        onSuggestionsFetchRequested={({ value }) => value}
        renderInputComponent={renderInputComponent}
        renderSuggestion={(suggestion) => suggestion.rootConditionReword || ''}
        suggestions={suggestions}
        theme={theme}
      />
      {Voice.isEnabled && voice && counter === maxLength ? (
        <Voice
          DialogContext={DialogContext}
          configuration={configuration}
          Actions={Actions}
          show={!!Local.get(Local.names.gdpr)}
          t={t('input.actions.record')}
        />
      ) : (
        counter < maxLength && <Actions actions={actions} className={c('dydu-input-actions', classes.actions)} />
      )}
    </form>
  );
}

Input.defaultProps = {
  focus: true,
};

Input.propTypes = {
  focus: PropTypes.bool,
  onRequest: PropTypes.func.isRequired,
  onResponse: PropTypes.func.isRequired,
};
