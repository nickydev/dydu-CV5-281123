import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { currentLocationContainsCodeParamater, currentLocationContainsError, isDefined } from '../helpers';

import PropTypes from 'prop-types';
import Storage from '../Storage';
import jwtDecode from 'jwt-decode';
import useAuthorizeRequest from '../hooks/useAuthorizeRequest';
import useTokenRequest from '../hooks/useTokenRequest';
import useUserInfo from '../hooks/useUserInfo';

const AuthContext = React.createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, configuration }) {
  const [token, setToken] = useState(Storage.loadToken());
  const [isLoggedIn, setIsLoggedIn] = useState(isDefined(token?.access_token) || false);
  const [userInfo, setUserInfo] = useState(null);

  const { authorize, error: errorAuthorize } = useAuthorizeRequest(configuration);
  const { fetchToken, error: errorToken } = useTokenRequest(configuration);
  const { getUserInfoWithToken } = useUserInfo(configuration);

  useEffect(() => {
    if (errorAuthorize || errorToken) {
      const appBaseUrl = Storage.loadPkce()?.redirectUri;
      console.log(appBaseUrl);
      Storage.clearAll();
      setToken(() => {
        return null;
      });
    }
  }, [errorAuthorize, errorToken]);

  useEffect(() => {
    const canRequestToken =
      currentLocationContainsCodeParamater() &&
      Storage.containsPkce() &&
      !isDefined(token?.access_token) &&
      !currentLocationContainsError();

    if (canRequestToken)
      fetchToken().then((tkn) => {
        setIsLoggedIn(true);
        setToken(tkn);
      });
  }, [fetchToken, token, token?.access_token]);

  useEffect(() => {
    if (isLoggedIn && token) {
      try {
        const userInfo = jwtDecode(token?.access_token);
        setUserInfo(userInfo);
      } catch (error) {
        console.error(error);
      }
    }
  }, [token, isLoggedIn, getUserInfoWithToken]);

  const login = useCallback(() => {
    const canRequestAuthorize =
      !isLoggedIn &&
      !Storage.containsPkce() &&
      !currentLocationContainsCodeParamater() &&
      !currentLocationContainsError();

    if (canRequestAuthorize) authorize();
  }, [authorize, isLoggedIn]);

  const dataContext = useMemo(
    () => ({
      userInfo,
      isLoggedIn,
      login,
      token,
      ...configuration,
    }),
    [configuration, isLoggedIn, login, token, userInfo],
  );

  return <AuthContext.Provider value={dataContext}>{children}</AuthContext.Provider>;
}

export function AuthProtected({ children, enable = false }) {
  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    console.log('AuthProtected/Effect() :', { isLoggedIn });
    if (!enable) return;
    if (!isLoggedIn) login();
  }, [isLoggedIn, login]);

  if (!enable) return children;

  return isLoggedIn && enable ? children : null;
}

AuthProvider.propTypes = {
  children: PropTypes.any,
  configuration: PropTypes.shape({
    clientId: PropTypes.string,
    authorizePath: PropTypes.string,
    tokenPath: PropTypes.string,
    redirectUri: PropTypes.string,
    provider: PropTypes.string,
    scope: PropTypes.array,
  }),
};

AuthProtected.propTypes = {
  children: PropTypes.any,
  enable: PropTypes.bool,
};
