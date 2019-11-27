import c from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '../../contexts/ModalContext';
import sanitize from '../../tools/sanitize';
import Actions from '../Actions';
import useStyles from './styles';


/**
 * GDPR form. Basically prompt for an email.
 */
export default function ModalGdpr({ className, component, ...rest }) {

  const { onReject, onResolve } = useContext(ModalContext);
  const [ email, setEmail ] = useState('');
  const classes = useStyles();
  const { t } = useTranslation('gdpr');

  const onCancel = () => {
    onReject();
  };

  const onChange = event => {
    setEmail(event.target.value);
  };

  const onSubmit = event => {
    event.preventDefault();
    onResolve(email);
  };

  const actions = [
    {action: onCancel, text: t('form.cancel')},
    {text: t('form.submit'), type: 'submit'},
  ];

  const help = sanitize(t('form.help'));

  return React.createElement(
    component,
    {className: c('dydu-modal-gdpr', classes.root, className), title: t('form.title'), ...rest},
    (
      <>
        {help && <div className={c('dydu-modal-gdpr-help', classes.help)} dangerouslySetInnerHTML={{__html: help}} />}
        <form className="dydu-modal-gdpr-form" onSubmit={onSubmit}>
          <label className="dydu-modal-gdpr-form-field">
            <div children={t('form.email.label')} />
            <input className={classes.input}
                   onChange={onChange}
                   placeholder={t('form.email.placeholder')}
                   required
                   type="email"
                   value={email} />
          </label>
          <Actions actions={actions} className="dydu-modal-gdpr-form-actions" />
        </form>
      </>
    ),
  );
}



ModalGdpr.defaultProps = {
  component: 'div',
};


ModalGdpr.propTypes = {
  className: PropTypes.string,
  component: PropTypes.elementType,
};
