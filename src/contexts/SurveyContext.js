import React, { useMemo, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDialog } from './DialogContext';
import { isDefined } from '../tools/helpers';
import dydu from '../tools/dydu';
import Survey from '../Survey/Survey';

const SurveyContext = React.createContext({});

export const useSurvey = () => useContext(SurveyContext);

const extractId = (data) => data?.values?.survey?.fromBase64();

const getSurveyConfigurationById = (id) => dydu.getSurvey(id);

export default function SurveyProvider({ children }) {
  const { open: openSecondary } = useDialog();
  const [id, setId] = useState(null);
  const [configuration, setConfiguration] = useState(null);

  const showSurvey = useCallback((data) => setId(extractId(data)), []);

  useEffect(() => {
    if (isDefined(id)) getSurveyConfigurationById(id).then(setConfiguration);
  }, [id]);

  useEffect(() => {
    if (!isDefined(configuration)) return;
    console.log('survey config', configuration);
    openSecondary({
      title: configuration?.title,
      bodyRenderer: () => <Survey configuration={configuration} />,
    });
  }, [configuration, openSecondary]);

  const dataContext = useMemo(() => {
    return {
      showSurvey,
    };
  }, [showSurvey]);

  return <SurveyContext.Provider value={dataContext}>{children}</SurveyContext.Provider>;
}

SurveyProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node]),
};
