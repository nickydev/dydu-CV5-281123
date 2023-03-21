/* eslint-disable */
import '../prototypes/strings';

import Storage from '../../components/auth/Storage';
import { Cookie, Local } from '../storage';
import { ConfigurationFixture } from '../../test/fixtures/configuration';
import { objectContainFields, objectToQueryParam, secondsToMs, strContains } from '../helpers';

const _Local = jest.requireActual('../storage').Local;
const dyduRelativeLocation = '../dydu';
let _dydu = jest.requireActual(dyduRelativeLocation).default;

jest.mock(dyduRelativeLocation, () => ({
  default: jest.fn(),
}));

jest.mock('../storage', () => ({
  Local: {
    visit: {
      save: jest.fn(),
    },
    welcomeKnowledge: {
      isSet: jest.fn(),
      save: jest.fn(),
      load: jest.fn(),
    },
    saml: {
      load: jest.fn(),
      save: jest.fn(),
    },
    get: jest.fn(),
    set: jest.fn(),
    names: { space: 'LS-KEY-SPACE' },
    byBotId: jest.fn(),
    contextId: {
      save: jest.fn(),
      load: jest.fn(),
      createKey: jest.fn(),
    },
    clientId: {
      getKey: jest.fn(),
      isSet: jest.fn(),
      createAndSave: jest.fn(),
      load: jest.fn(),
    },
  },
  Cookie: {
    get: jest.fn(),
  },
}));

let spied = [];
let dydu;

describe('dydu.js', function () {
  beforeEach(() => {
    jestRestoreMocked(spied);
    spied = [];
    dydu = _dydu;
  });

  afterEach(() => {
    jestRestoreMocked(spied);
    jestRestoreMocked(Object.values(spied));
    spied = [];
    dydu = _dydu;
  });

  describe('getWelcomeKnowledge', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['talk', 'getBotId']);
      spied.talk.mockResolvedValue({ response: true });
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(Local.welcomeKnowledge));
    });

    it('should check in localStorage', async () => {
      // GIVEN
      // WHEN
      await dydu.getWelcomeKnowledge();

      // THEN
      expect(Local.welcomeKnowledge.isSet).toHaveBeenCalled();
    });
    it('should return localStorage value', async () => {
      const botIdValue = 'bot-id';
      spied.getBotId.mockReturnValue(true);
      Local.welcomeKnowledge.isSet.mockReturnValue(botIdValue);
      Local.welcomeKnowledge.load.mockReturnValue(botIdValue);

      // WHEN
      const receivedValue = await dydu.getWelcomeKnowledge();

      // THEN
      expect(receivedValue).toEqual(botIdValue);

      jestRestoreMocked([Local.welcomeKnowledge.isSet, Local.welcomeKnowledge.load]);
    });
    it('should call |this.talk| when localStorage has no value', () => {
      // GIVEN
      Local.welcomeKnowledge.isSet.mockReturnValue(false);

      // WHEN
      dydu.getWelcomeKnowledge();

      // THEN
      expect(spied.talk).toHaveBeenCalled();
    });
    it('should save the wlecomeKnowledge in localStorage after requesting it', async () => {
      // GIVEN
      const botId = 'bot-id';
      spied.getBotId.mockReturnValue(botId);

      const talkResponse = { text: 'bot response' };
      spied.talk.mockResolvedValue(talkResponse);

      // WHEN
      await dydu.getWelcomeKnowledge();

      // THEN
      expect(Local.welcomeKnowledge.save).toHaveBeenCalledWith(botId, talkResponse);
    });
  });

  describe('getConfiguration', function () {
    it('should return |configuration| class attribute', () => {
      // GIVEN
      const expected = 'expected';
      dydu.configuration = expected;

      // WHEN
      const received = dydu.getConfiguration();

      // THEN
      expect(received).toEqual(expected);
    });
  });

  describe('setConfiguration', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['onConfigurationLoaded']);
    });

    it('should set the configuration', () => {
      // GIVEN
      const expected = 'expected';

      // WHEN
      dydu.setConfiguration(expected);

      // THEN
      expect(dydu.configuration).toEqual(expected);
    });
    it('should call |this.onConfigurationLoaded| after set configuration', () => {
      // GIVEN
      // WHEN
      dydu.setConfiguration();

      // THEN
      expect(spied.onConfigurationLoaded).toHaveBeenCalled();
    });
  });

  describe('onConfigurationLoaded', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, [
        'setInitialSpace',
        'setQualificationMode',
        'initLocaleWithConfiguration',
        'getSpace',
        'getConfiguration',
      ]);
      const c = new ConfigurationFixture();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(spied));
    });
    it('should call initializers', () => {
      const initializerFnList = ['setInitialSpace', 'setQualificationMode', 'initLocaleWithConfiguration'];
      dydu.onConfigurationLoaded();
      initializerFnList.forEach((initializerFn) => {
        expect(spied[initializerFn]).toHaveBeenCalled();
      });
    });
  });

  describe('initLocalWithConfiguration', () => {
    it('should get the local from Browser as configuration |getDefaultLanguageFromSite| is true', () => {});
    it('should get the local from configuration as |getDefaultLanguageFromSite| is false', () => {});
    it('should init I18N with the determinated locale', () => {});
  });

  describe('registerVisit', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['welcomeCall', 'getInfos']);
      spied.welcomeCall.mockResolvedValue(true);
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(spied));
    });
    it('should call |this.welcomeCall|', () => {
      // GIVEN
      // WHEN
      dydu.registerVisit();

      // THEN
      expect(spied.welcomeCall).toHaveBeenCalled();
    });
  });

  describe('getInfos', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getBotId', 'getLocale', 'getSpace']);
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(spied));
    });
    it('should match info object design', async () => {
      const infosEntity = {
        botId: '',
        locale: '',
        space: '',
      };

      // WHEN
      const receivedInfos = await dydu.getInfos();

      // THEN
      Object.keys(infosEntity).forEach((key) => {
        expect(`${key}` in receivedInfos).toEqual(true);
      });
    });
    it('should call methods to feed the info object', async () => {
      // GIVEN
      const methods = ['getBotId', 'getLocale', 'getSpace'];

      // WHEN
      await dydu.getInfos();

      // THEN
      methods.every((methodName) => {
        expect(spied[methodName]).toHaveBeenCalled();
      });
    });
  });

  describe('getSurvey', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getBotId', 'getLocale', 'getConfiguration', 'post', 'emit']);
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(spied));
    });
    it('should return null when argument is null or undefined', async () => {
      // GIVEN
      // WHEN
      const received = await dydu.getSurvey(null);

      // THEN
      expect(received).toBeFalsy();
    });
    it('should call /chat/survey/configuration with the |surveyId| argument', async () => {
      // GIVEN
      // WHEN
      const received = await dydu.getSurvey('survey-id');

      // THEN
      const paramPosition = 0;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.post, paramPosition);
      const expectedPath = 'chat/survey/configuration';
      expect(strContains(effectiveParamValue, expectedPath)).toEqual(true);
    });
    it('should use a formUrlEncoded data', async () => {
      // GIVEN
      // WHEN
      const received = await dydu.getSurvey('survey-id');

      // THEN
      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.post, paramPosition);
      expect(isUrlFormEncoded(effectiveParamValue)).toEqual(true);
    });
    it('should make a post', async () => {
      const received = await dydu.getSurvey('survey-id');

      expect(spied.post).toHaveBeenCalled();
    });
  });

  describe('sendSurvey', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, [
        'formatFieldsForSurveyAnswerRequest',
        'createSurveyPayload',
        'post',
        'displaySurveySent',
      ]);
    });
    afterEach(() => {
      jestRestoreMocked(Object.values(spied));
    });
    it('should POST on /chat/survey', async () => {
      // GIVEN
      spied.createSurveyPayload.mockResolvedValue({ surveyPayload: true });
      spied.post.mockResolvedValue(true);

      // WHEN
      const surveyAnswer = {};
      await dydu.sendSurvey(surveyAnswer);

      // THEN
      const paramPosition = 0;
      const effectiveParam = mockFnGetParamValueAtPosition(spied.post, paramPosition);
      expect(spied.post).toHaveBeenCalled();
      const expectedPath = 'chat/survey';
      expect(strContains(effectiveParam, expectedPath)).toEqual(true);
    });
    it('should call |this.displaySurveySent| as a resolve of POST request', async () => {
      // GIVEN
      const surveyAnswer = { surveyId: 'survey-id' };
      spied.post.mockResolvedValue(true);
      spied.createSurveyPayload.mockResolvedValue(surveyAnswer);

      // WHEN
      await dydu.sendSurvey(surveyAnswer);

      // THEN
      expect(spied.displaySurveySent).toHaveBeenCalled();
    });
  });

  describe('createSurveyPayload', function () {
    it('should create correct object', async () => {
      // GIVEN
      const getContextIdSpy = jest.spyOn(dydu, 'getContextId').mockReturnValue('');

      const surveyId = 'survey-id';
      const surveyEntity = {
        ctx: '',
        uuid: surveyId,
      };
      // WHEN
      const received = await dydu.createSurveyPayload(surveyId, {});

      // THEN
      const isValid = objectContainFields(received, Object.keys(surveyEntity));
      expect(isValid).toEqual(true);
      jestRestoreMocked([getContextIdSpy]);
    });
  });

  describe('sendSurveyPolling', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getTalkBasePayload', 'setLastResponse', 'displaySurveySent']);
    });
    it('should call |fetch| with GET as method argument', async () => {
      // GIVEN
      fetchMock.mockResolvedValue({ json: jest.fn() });

      // WHEN
      await dydu.sendSurveyPolling({});

      // THEN
      expect(fetchMock).toHaveBeenCalled();
    });
    it('should call |emit| with /servlet/chatHttp as path argument', () => {});
    it('should set the lastResponse to the just fetched value', () => {});
    it('should call |displaySurveySent| after setting |lastResponse|', () => {});
  });

  xdescribe('getTalkBasePayload', function () {
    let validPayload;
    beforeEach(() => {
      validPayload = {
        contextId: '',
        alreadyCame: '',
        browser: '',
        clientId: '',
        doNotRegisterInteraction: '',
        language: '',
        os: '',
        qualificationMode: '',
        space: '',
        tokenUserData: '',
        userUrl: '',
        solutionUsed: '',
        variables: '',
      };
      spied = jestSpyOnList(dydu, [
        'getContextId',
        'alreadyCame',
        'getClientId',
        'getLocale',
        'getSpace',
        'getVariables',
      ]);
    });

    it('should return a talk object payload', () => {
      const talkPayload = dydu.getTalkBasePayload({});
      expect(talkPayload).toEqual('');
      Object.keys(validPayload).forEach((key) => {
        expect(`${key}` in talkPayload).toEqual(true);
      });
    });
    it('should considere option argument for |doNotRegisterInteraction| field', () => {});
    it('should call methods to get values', () => {
      const valueProviders = ['getContextId', 'alreadyCame', 'getClientId', 'getLocal', 'getSpace', 'getVariable'];
    });
  });

  describe('formatFieldsForSurveyAnswerRequest', () => {
    it('should return an object with fields keys prepended by field_', () => {});
  });

  describe('get', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['emit']);
    });
    it('should call |emit| with axios.get as first parameter', () => {
      // GIVEN
      // WHEN
      dydu.get('path/to/ressource', {});

      // THEN
      expect(dydu.emit).toHaveBeenCalled();
    });
  });

  describe('post', function () {
    it('should call |emit| with axios.post as first parameter', () => {});
  });

  describe('whoami', () => {
    it('should GET request on whoami/ api', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['emit']);
      spied.emit.mockResolvedValue({});
      // WHEN
      await dydu.whoami();

      // THEN
      const paramPosition = 1;
      const effectiveValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      const expectedPath = 'whoami/';
      expect(effectiveValue).toEqual(expectedPath);
    });
  });

  describe('welcomeCall', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, [
        'emit',
        'getContextId',
        'getLocale',
        'getSpace',
        'getConfiguration',
        'getVariables',
      ]);
    });
    it('should call |getContextId|', () => {
      // GIVEN
      // WHEN
      dydu.welcomeCall();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
    });
    it('should POST request on chat/welcomecall/', async () => {
      // GIVEN
      // WHEN
      await dydu.welcomeCall();

      // THEN
      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(dydu.emit, paramPosition);
      const expectedPath = 'chat/welcomecall/';
      expect(strContains(effectiveParamValue, expectedPath)).toEqual(true);
    });
    it('should requests with url encoded datas', async () => {
      //GIVEN
      // WHEN
      await dydu.welcomeCall();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(isUrlFormEncoded(effectivePayloadParameterValue)).toEqual(true);
    });
    it('should match correct datas', async () => {
      // GIVEN
      const payload = {
        contextUuid: '',
        language: '',
        qualificationMode: '',
        solutionUsed: '',
        space: '',
        variables: '',
      };
      spied.getContextId.mockResolvedValue('context-id');
      const expectedKeys = Object.keys(payload);

      // WHEN
      await dydu.welcomeCall();

      // THEN
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expectedKeys.forEach((keyString) => {
        expect(strContains(effectivePayloadParameterValue, keyString)).toEqual(true);
      });
    });
  });

  describe('top', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['emit', 'getLocale', 'getSpace', 'getConfiguration']);
    });
    it('should POST on chat/topknowledge api', async () => {
      // GIVEN
      // WHEN
      await dydu.top();

      // THEN
      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(dydu.emit, paramPosition);
      const expectedPath = 'chat/topknowledge';
      expect(strContains(effectiveParamValue, expectedPath)).toEqual(true);
    });
    it('should use url encoded as data parameter of |emit|', async () => {
      //GIVEN
      // WHEN
      await dydu.top();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(isUrlFormEncoded(effectivePayloadParameterValue)).toEqual(true);
    });
    it('should match correct datas', async () => {
      // GIVEN
      spied.getLocale.mockReturnValue('fr');
      spied.getSpace.mockReturnValue('space');

      const payload = {
        language: '',
        solutionUsed: '',
        space: '',
      };

      const expectedKeys = Object.keys(payload).concat(['period', 'maxKnowledge']);

      // WHEN
      const periodValue = 'periodValue';
      const size = 2;
      await dydu.top(periodValue, size);

      // THEN
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expectedKeys.forEach((keyString) => {
        expect(strContains(effectivePayloadParameterValue, keyString)).toEqual(true);
      });
    });
  });

  describe('getBotId', () => {
    it('should return the correct bot id', () => {});
  });

  describe('poll', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['emit', 'getContextId', 'getLocale', 'getConfiguration', 'getSpace']);
    });

    it('should POST on /chat/poll/last', async () => {
      // GIVEN
      spied.getContextId.mockResolvedValue('');

      // WHEN
      await dydu.poll({});

      // THEN
      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(dydu.emit, paramPosition);
      const expectedPath = 'chat/poll/last/';
      expect(strContains(effectiveParamValue, expectedPath)).toEqual(true);
    });
    it('should use form url encoded', async () => {
      //GIVEN
      // WHEN
      await dydu.poll({});

      // THEN
      expect(spied.emit).toHaveBeenCalled();
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(isUrlFormEncoded(effectivePayloadParameterValue)).toEqual(true);
    });
    it('should send correct payload', async () => {
      // GIVEN
      const payload = {
        solutionUsed: '',
        format: '',
        space: '',
        contextUuid: '',
        language: '',
        lastPoll: '',
      };
      spied.getLocale.mockReturnValue('');
      spied.getSpace.mockReturnValue('');

      // WHEN
      await dydu.poll({ contextId: '' });

      // THEN
      const paramPosition = 2;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      Object.keys(payload).forEach((key) => {
        expect(strContains(effectiveParamValue, key)).toEqual(true);
      });
    });
  });

  describe('typing', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['alreadyCame', 'getContextId', 'getLocale', 'getSpace', 'getClientId']);
      spied.getLocale.mockReturnValue('');
      spied.getSpace.mockReturnValue('');
      fetchMock.mockResolvedValue({ json: jest.fn() });
    });
    it('should GET request on /servlet/chatHttp with url parameter', async () => {
      // GIVEN
      // WHEN
      await dydu.typing('text');

      // THEN
      expect(fetchMock).toHaveBeenCalled();
      const paramPosition = 0;
      const effectiveParamValue = mockFnGetParamValueAtPosition(fetchMock, paramPosition);
      expect(strContains(effectiveParamValue, 'servlet/chatHttp')).toEqual(true);
    });
  });

  describe('getSaml2Status', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['emit', 'getConfiguration']);
    });
    it('should GET request on /saml2/status with query parameter', async () => {
      const expectedValue = 'saml2/status';

      await dydu.getSaml2Status();

      expect(spied.emit).toHaveBeenCalled();
      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(strContains(effectiveParamValue, expectedValue)).toEqual(true);
    });
    it('should send saml value in payload when saml is enabled', () => {
      const c = new ConfigurationFixture();
      c.enableSaml();

      spied.getConfiguration.mockReturnValue(c.getConfiguration());

      const tokenValue = 'token-value';
      dydu.getSaml2Status(tokenValue);

      const paramPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(strContains(effectiveParamValue, tokenValue)).toEqual(true);
    });
  });

  describe('getServerStatus', () => {
    it('should GET request on /serverstatus', () => {});
  });

  describe('handleSpaceWithTalkResponse', () => {
    it('should check #guiCSName keys in the argument object', () => {});
    it('should call |setSpace| if #guiCSName is defined', () => {});
    it('should not modify the argument and return it', () => {});
  });

  describe('processTalkResponse', () => {
    it('should call |handleSpaceWithTalkResponse|', () => {});
    it('should call |handleKnownledgeQuerySurveyWithTalkResponse|', () => {});
    it('should not modify the argument and return it as is', () => {});
  });

  describe('talk', () => {
    it('should call |emit| for POST on /chat/talk using bot id and context id', () => {});
    it('should create a correct payload', () => {});
    it('should includes saml infos as part of the payload if it is enabled in configuration', () => {});
    it('should use a form url encoded payload', () => {});
  });

  describe('suggest', () => {
    it('should call |emit| for POST on /chat/search with bot id', () => {});
    it('should uses form url data encoding', () => {});
  });

  describe('qualificationMode', () => {
    it('should get the value from window object', () => {});
    it('should use the argument as value', () => {});
    it('should set the |qualificationMode| class attribute', () => {});
  });

  describe('setSpace', () => {
    it('should set the |space| class attribute to the argument', () => {});
    it('should save the space to localStorage', () => {});
    it("should save lowercased if value is 'defaul'", () => {});
  });
  describe('getContextVariables', () => {
    it('should return an html list of variables', () => {});
  });
  describe('setLocale', () => {
    it('should set the |local| class attribute when the local is includes in the |languages| parameter', () => {});
    it('should save the |locale| parameter in the localStorage', () => {});
  });

  describe('reset', () => {
    it('should call |getContextId| with parameter to force request', () => {});
    it('should |emit| POST request to path chat/context/ and bot id', () => {});
  });

  describe('printHistory', () => {
    it('should call |getContextId|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId']);

      // WHEN
      await dydu.printHistory();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
    });
    it('should insert an iframe with correct path', () => {});
  });

  describe('pushrules', () => {
    it('should call |emit|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['emit']);

      // WHEN
      await dydu.pushrules();

      // THEN
      expect(dydu.emit).toHaveBeenCalled();
    });
    it('should |emit| POST request on /chat/pushrules and bot id', () => {});
  });

  describe('history', () => {
    it('should call |getContextId|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId']);

      // WHEN
      await dydu.history();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
    });
    it('should call |emit| when contextId exist', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['emit', 'getContextId']);
      spied.getContextId.mockResolvedValue('context-id');

      // WHEN
      await dydu.history();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
    });
    it('should |emit| POST request with chat/history path and correct data', () => {});
  });

  describe('getSpace', () => {
    const { location } = window;
    beforeAll(() => {
      delete window.location;
      window.location = { href: '' };
    });

    afterAll(() => {
      window.location = location;
    });

    it('should get the space value from configuration when space is not defined and no argument is given', () => {
      // GIVEN
      const defaultSpace = 'default-space';
      spied = jestSpyOnList(dydu, ['getConfiguration']);
      spied.getConfiguration.mockReturnValue({ spaces: { items: [defaultSpace] } });

      // WHEN

      dydu.space = null;
      const nullArg = null;
      const receivedSpace = dydu.getSpace(nullArg);

      // THEN
      expect(receivedSpace).toEqual(defaultSpace);
    });
    it('should save space to localStorage', () => {
      // GIVEN
      const currentSpace = 'current-space';

      // WHEN
      dydu.space = currentSpace;
      dydu.getSpace();

      // THEN
      expect(Local.set).toHaveBeenCalledWith(Local.names.space, currentSpace);
    });
    it('should return the |space| class attribute', () => {
      // GIVEN
      const currentSpace = 'current-space';

      // WHEN
      dydu.space = currentSpace;
      const receivedSpace = dydu.getSpace();

      // THEN
      expect(receivedSpace).toEqual(currentSpace);
    });
    it('should get space from configuration when no strategy mode is active in the list argument and current space is null', () => {
      // GIVEN
      const configurationFixture = new ConfigurationFixture();
      dydu.getConfiguration = jest.fn().mockReturnValue(configurationFixture.getConfiguration());
      const strategiesAllDisabled = configurationFixture.getSpaceConfig().detection.map((modeObject) => {
        return {
          ...modeObject,
          active: false, // disable all
        };
      });

      // WHEN
      const currentSpace = null;
      dydu.space = currentSpace;
      const receivedSpace = dydu.getSpace(strategiesAllDisabled);

      // THEN
      expect(receivedSpace).toEqual(dydu.getConfiguration().spaces.items[0]);
    });
    it('should use cookie strategy', () => {
      // GIVEN
      const result = 'result-value';
      Cookie.get.mockReturnValue(result);
      const cookieModeValue = 'cookie-mode-value';
      const cookieDetectionItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.cookie,
        active: true,
        value: cookieModeValue,
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(cookieDetectionItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(Cookie.get).toHaveBeenCalledWith(cookieModeValue);
      expect(receivedSpace).toEqual(result);
    });
    it('should use global strategy', () => {
      // GIVEN
      const expectedResult = 'expectedSpacename';
      const targetWindowKey = 'customKey';
      window[targetWindowKey] = expectedResult;

      const globalModeItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.global,
        active: true,
        value: targetWindowKey,
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(globalModeItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(expectedResult);
    });
    it('should use hostname strategy', () => {
      // GIVEN
      const targetHostname = 'target-hostname.io';
      window.location = {
        hostname: targetHostname,
      };

      const expectedResult = 'expected-space';
      const hostnameModeItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.hostname,
        active: true,
        value: {
          [targetHostname]: expectedResult,
        },
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(hostnameModeItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(expectedResult);
    });
    it('should use localstorage strategy', () => {
      // GIVEN
      const expectedResult = 'expected-space';
      Local.get.mockReturnValue(expectedResult);

      const lsModeValue = 'value';
      const localstorageModeItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.localstorage,
        active: true,
        value: lsModeValue,
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(localstorageModeItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(expectedResult);
    });
    it('should use route strategy', () => {
      // GIVEN
      const targetPathname = '/urlpart/test/file';
      window.location = {
        pathname: targetPathname,
      };

      const expectedResult = 'expected-space';
      const routeModeItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.route,
        active: true,
        value: {
          [targetPathname]: expectedResult,
        },
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(routeModeItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(expectedResult);
    });
    it('should use urlparameter strategy', () => {
      // GIVEN
      const expectedResult = 'urlpart';
      const targetQparameterName = 'test';
      const targetSearch = `?${targetQparameterName}=${expectedResult}`;
      window.location = {
        search: targetSearch,
      };

      const urlparameterModeItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.urlparameter,
        active: true,
        value: targetQparameterName,
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(urlparameterModeItem);
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(expectedResult);
    });
    it('should use urlpart strategy', () => {
      // GIVEN
      // set current url
      window.location = {
        href: 'http://currenthref/urlpart/test/file',
      };

      // activate urlpart Item
      const urlpartTarget = 'urlpart/test/';
      const urlpartSpaceName = 'urlpart-space-name';
      const urlpartDetectionItem = {
        mode: ConfigurationFixture.SPACE_DETECTION_MODE.urlpart,
        active: true,
        value: {
          [urlpartTarget]: urlpartSpaceName,
        },
      };
      const configuration = new ConfigurationFixture();
      configuration.updateSpaceDetectionMode(urlpartDetectionItem);

      // get strategy list
      const strategies = configuration.getSpaceConfig().detection;

      // WHEN
      const receivedSpace = dydu.getSpace(strategies);

      // THEN
      expect(receivedSpace).toEqual(urlpartSpaceName);
    });
  });

  describe('getLocal', () => {
    it('should get local from configuration when |locale| class attribute is not defined', () => {});
    it('should get locale value from localStorage when |locale| class attribute is not defined', () => {});
    it('should get locale from site document when configuration |getDefaultLanguageFromSite| is set to true', () => {});
    it('should not save language dash separator in localstorage', () => {});
    it('should not contains language dash separator', () => {});
  });

  describe('getConfiguration', () => {
    it('should return |configuration| class attribute value', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, [
        'onConfigurationLoaded',
        'getSpace',
        'setInitialSpace',
        'setQualificationMode',
        'initLocaleWithConfiguration',
      ]);

      const config = new ConfigurationFixture();
      const _config = config.getConfiguration();
      dydu.configuration = _config;

      // WHEN
      const receivedValue = dydu.getConfiguration();

      // THEN
      expect(receivedValue).toEqual(_config);
    });
  });

  describe('setContextId', () => {
    it('should call |saveContextIdToLocalStorage| with the argument when argument is defined', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['saveContextIdToLocalStorage']);

      // WHEN
      const contextId = 'context-id';
      dydu.setContextId(contextId);

      // THEN
      expect(spied.saveContextIdToLocalStorage).toHaveBeenCalledWith(contextId);
    });
  });

  describe('saveContextIdToLocalStorage', function () {
    it('it should call |getContextIdStorageKey|', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextIdStorageKey']);
      const s = jest.spyOn(Local.contextId, 'save');

      // WHEN
      const contextId = 'context-id';
      dydu.saveContextIdToLocalStorage(contextId);

      // THEN
      expect(spied.getContextIdStorageKey).toHaveBeenCalled();
      s.mockRestore();
    });
    it('should call |Local.contextId.save| with the correct key and value', () => {
      // GIVEN
      const contextIdKey = 'context-id-key';
      spied = jestSpyOnList(dydu, ['getContextIdStorageKey']);
      dydu.getContextIdStorageKey.mockReturnValue(contextIdKey);
      const s = jest.spyOn(Local.contextId, 'save');

      // WHEN
      const contextIdValue = 'context-id-value';
      dydu.saveContextIdToLocalStorage(contextIdValue);

      // THEN
      expect(s).toHaveBeenCalledWith(contextIdKey, contextIdValue);
      s.mockRestore();
    });
  });

  describe('getContextId', function () {
    it('should call |getContextIdFromLocalStorage| when argument is false or is not set', () => {});
    it('should |emit| POST on chat/context with form url encoded data', () => {});
    it('should call |setContextId| with the request response', () => {});
    it('should return empty string if error occurs', () => {});
    it('should send correct payload', () => {});
  });

  describe('getContextIdFromLocalStorage', function () {
    it('should call |getContextIdStorageKey', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextIdStorageKey']);

      // WHEN
      dydu.getContextIdFromLocalStorage();

      // THEN
      expect(spied.getContextIdStorageKey).toHaveBeenCalled();
    });
    it('should call |Local.contextId.load| with key from storage', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextIdStorageKey']);
      const storageSavedKey = 'storage-saved-key';
      spied.getContextIdStorageKey.mockReturnValue(storageSavedKey);

      const s = jest.spyOn(Local.contextId, 'load');

      // WHEN
      dydu.getContextIdFromLocalStorage();

      // THEN
      expect(s).toHaveBeenCalledWith(storageSavedKey);
      s.mockRestore();
    });
  });

  describe('getContextIdStorageKey', function () {
    it('should call |Local.contextId.createKey|', () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getBotId']);
      const s = jest.spyOn(Local.contextId, 'createKey');

      // WHEN
      dydu.getContextIdStorageKey();

      // THEN
      expect(s).toHaveBeenCalled();
      s.mockRestore();
    });
    it('should call |getBotId|', () => {
      // GIVEN
      dydu.getBotId = jest.fn();

      // WHEN
      dydu.getContextIdStorageKey();

      // THEN
      expect(dydu.getBotId).toHaveBeenCalled();
    });
    it('should call |Local.contextId.createKey| with currentBotId and configId', () => {
      // GIVEN
      const currentBotId = 'current-bot-id';
      dydu.getBotId = jest.fn().mockReturnValue(currentBotId);

      //const currentConfigId = "current-config-id"; // to fix
      const currentConfigId = 'main/';
      const botConfigContentFile = {
        bot: 'bot-id',
        configId: currentConfigId,
        server: 'server',
        backUpServer: 'backupServer',
      };
      window.location = {
        search: `?${objectToQueryParam(botConfigContentFile)}`,
      };
      /*
      loadDyduWithBotConfig({
        bot: "bot-id",
        configId: currentConfigId,
        server: "server",
        backUpServer: "backupServer"
      });
       */

      // WHEN
      dydu.getContextIdStorageKey();

      expect(Local.contextId.createKey).toHaveBeenCalledWith(currentBotId, currentConfigId);
    });
  });

  describe('getClientId', function () {
    it('should call |Local.clientId.getKey| with infoObject', () => {
      // GIVEN
      const infoObject = {
        locale: 'locale',
        space: 'space',
        botId: 'botId',
      };
      dydu.infos = infoObject;

      // WHEN
      dydu.getClientId();

      // THEN
      expect(Local.clientId.getKey).toHaveBeenCalledWith(infoObject);
    });

    it('should call |Local.clientId.createAndSave| if |alreadyCame| is false', () => {
      // GIVEN
      dydu.alreadyCame = jest.fn().mockReturnValue(false);
      Local.clientId.createAndSave = jest.fn();
      // WHEN
      dydu.getClientId();

      // THEN
      expect(Local.clientId.createAndSave).toHaveBeenCalled();
    });
    it('should call |Local.clientId.load|', () => {
      // GIVEN
      const infoObject = {
        locale: 'locale',
        space: 'space',
        botId: 'botId',
      };
      dydu.infos = infoObject;

      // WHEN
      dydu.getClientId();

      // THEN
      expect(Local.clientId.getKey).toHaveBeenCalledWith(infoObject);
    });
  });

  describe('hasUserAcceptedGdpr', () => {
    it('should return false', () => {
      // GIVEN
      const value = null;
      const expected = !!value;
      Local.get.mockReturnValue(value);
      Local.byBotId.mockReturnValue({ get: jest.fn().mockReturnValue(value) });

      // WHEN
      const received = dydu.hasUserAcceptedGdpr();

      // THEN
      expect(received).toEqual(expected);
    });
    it('should return true', () => {
      // GIVEN
      const value = 'value';
      const expected = !!value;
      Local.get.mockReturnValue(value);
      Local.byBotId.mockReturnValue({ get: jest.fn().mockReturnValue(value) });

      // WHEN
      const received = dydu.hasUserAcceptedGdpr();

      // THEN
      expect(received).toEqual(expected);
    });
    it('should call |getBotId|', () => {
      // GIVEN
      dydu.getBotId = jest.fn();
      Local.byBotId.mockReturnValue({ get: jest.fn() });

      // WHEN
      dydu.hasUserAcceptedGdpr();
      // THEN
      expect(Local.byBotId).toHaveBeenCalled();
    });
    it('should call |Local.byBotId| with current botId', () => {
      // GIVEN
      const currentBotId = 'current-bot-id';
      dydu.getBotId = jest.fn().mockReturnValue(currentBotId);
      Local.byBotId.mockReturnValue({ get: jest.fn() });

      // WHEN
      dydu.hasUserAcceptedGdpr();
      // THEN
      expect(Local.byBotId).toHaveBeenCalledWith(currentBotId);
    });
    it('should call |Local.get| with gdpr localStorage key name', () => {
      // GIVEN
      const gdprLSKeyName = 'gdrp';
      Local.names.gdpr = gdprLSKeyName;
      const spiedLocalGet = jest.spyOn(Local, 'get');
      const spiedByBotId = jest.spyOn(Local, 'byBotId');
      spiedByBotId.mockReturnValue({ get: jest.fn() });

      // WHEN
      dydu.hasUserAcceptedGdpr();

      // THEN
      expect(spiedLocalGet).toHaveBeenCalledWith(gdprLSKeyName);
      jestRestoreMocked([spiedLocalGet, spiedByBotId]);
    });
  });

  describe('gdpr', function () {
    it('should call |emit|', () => {
      // GIVEN
    });
    it('should call |emit| for POST', () => {});
    it('should call |emit| with chat/gdpr as path argument', () => {});
    it('should call |emit| with form url encoded string as data argument', () => {});
    it('should include saml infos in payload if it is enabled in configuration', () => {});
  });

  describe('feedbackInsatisfaction', function () {
    it('should call |getContextId|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId']);

      // WHEN
      await dydu.feedbackInsatisfaction();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
    });
    it('should include the |choiceKey| parameter in payload', async () => {
      // GIVEN

      spied = jestSpyOnList(dydu, ['getConfiguration', 'getContextId', 'emit']);
      const config = new ConfigurationFixture();
      config.enableSaml();
      spied.getConfiguration.mockReturnValue(config.getConfiguration());
      const s = jest.spyOn(Local.saml, 'load');

      // WHEN
      const choiceKey = 'choice-key';
      await dydu.feedbackInsatisfaction(choiceKey);

      // THEN
      expect(spied.emit).toHaveBeenCalledWith(
        undefined,
        'chat/feedback/insatisfaction/undefined/',
        `choiceKey=${choiceKey}&contextUUID=&solutionUsed=ASSISTANT`,
      );
      s.mockRestore();
    });
    it('should call |emit|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
      const c = new ConfigurationFixture();
      spied.getContextId.mockResolvedValue(null);
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
      Local.saml.load = jest.fn();

      // WHEN
      await dydu.feedbackInsatisfaction();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
    });
    it('should call |emit| for POST', async () => {});
    it('should call |emit| with chat/feedback/insatisfaction/ as path argument', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
      const c = new ConfigurationFixture();
      spied.getContextId.mockResolvedValue(null);
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
      Local.saml.load = jest.fn();

      // WHEN
      await dydu.feedbackInsatisfaction();

      // THEN

      const targetPath = 'chat/feedback/insatisfaction/';
      const pathArg = spied.emit.mock.calls[0][1];
      expect(strContains(pathArg, targetPath)).toEqual(true);
    });
    it('should call |emit| with form url encoded string as data argument', async () => {
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
      const c = new ConfigurationFixture();
      spied.getContextId.mockResolvedValue(null);
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
      Local.saml.load = jest.fn();

      // WHEN
      await dydu.feedbackInsatisfaction();

      // THEN
      const dataArg = spied.emit.mock.calls[0][2];
      expect(isUrlFormEncoded(dataArg)).toEqual(true);
    });
  });

  describe('feedbackComment', function () {
    it('should call |getContextId|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
      spied.getContextId.mockResolvedValue(null);
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load');

      // WHEN
      await dydu.feedbackComment();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should call |getConfiguration|', async () => {
      // GIVEN
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
      spied.getContextId.mockResolvedValue(null);
      const c = new ConfigurationFixture();
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load');

      // WHEN
      await dydu.feedbackComment();

      // THEN
      expect(spied.getConfiguration).toHaveBeenCalled();
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should call |Local.saml.load| if saml is enabled in configuration', () => {});
    it('should call |emit| with path chat/feedback/comment/', () => {});
    it('should call |emit| with form url payload', () => {});
    it('should includes saml info in payload when saml is enabled in configuration', () => {});
    it('should includes |comment| from parameter in payload', () => {});
  });

  describe('feedback', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getContextId', 'getConfiguration', 'emit']);
    });

    it('should call |getContextId|', async () => {
      // GIVEN
      spied.getContextId.mockResolvedValue(null);
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load');

      // WHEN
      await dydu.feedback();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should call |getConfiguration|', async () => {
      // GIVEN
      spied.getContextId.mockResolvedValue(null);
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load');

      // WHEN
      await dydu.feedback();

      // THEN
      expect(spied.getConfiguration).toHaveBeenCalled();
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should call |Local.saml.load| if saml is enabled in configuration', async () => {
      // GIVEN
      spied.getContextId.mockResolvedValue(null);
      const c = new ConfigurationFixture();
      c.enableSaml();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load');

      // WHEN
      await dydu.feedback();

      // THEN
      expect(spiedSamlLoad).toHaveBeenCalled();
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should call |emit| with path chat/feedback/', async () => {
      // GIVEN
      spied.getContextId.mockResolvedValue(null);

      // WHEN
      await dydu.feedback();

      // THEN
      const targetPath = 'chat/feedback/';
      const pathArg = spied.emit.mock.calls[0][1];
      expect(strContains(pathArg, targetPath)).toEqual(true);
    });
    it('should call |emit| with form url payload', async () => {
      // GIVEN
      // WHEN
      await dydu.feedback();

      // THEN
      const dataArg = spied.emit.mock.calls[0][2];
      expect(isUrlFormEncoded(dataArg)).toEqual(true);
    });
    it('should includes saml info in payload when saml is enabled in configuration', async () => {
      // GIVEN
      const samlValue = 'saml-value';
      const spiedSamlLoad = jest.spyOn(Local.saml, 'load').mockReturnValue(samlValue);
      const c = new ConfigurationFixture();
      c.enableSaml();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());

      // WHEN
      await dydu.feedback();

      // THEN
      const paramPosition = 2;
      const formUrlPayload = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      const samlInfo = `saml2_info=${samlValue}`;
      expect(strContains(formUrlPayload, samlInfo)).toEqual(true);
      jestRestoreMocked([spiedSamlLoad]);
    });
    it('should includes |feedback| in payload', async () => {
      // GIVEN
      // WHEN
      await dydu.feedback(false);
      // THEN
      const paramPosition = 2;
      const formUrlPayload = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      const feedbackKey = 'feedBack=';
      expect(strContains(formUrlPayload, feedbackKey)).toEqual(true);
    });
    it('should set |feedback| payload value to negative', async () => {
      // GIVEN
      const userResponse = false;
      // WHEN
      await dydu.feedback(userResponse);
      // THEN
      const paramPosition = 2;
      const formUrlPayload = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      const feedbackKey = 'feedBack=negative';
      expect(strContains(formUrlPayload, feedbackKey)).toEqual(true);
    });
    it('should set |feedback| payload value to positive', async () => {
      // GIVEN
      const userResponse = true;
      // WHEN
      await dydu.feedback(userResponse);
      // THEN
      const paramPosition = 2;
      const formUrlPayload = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      const feedbackKey = 'feedBack=positive';
      expect(strContains(formUrlPayload, feedbackKey)).toEqual(true);
    });
  });

  describe('exportConverstaion', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getContextId', 'getClientId', 'getLocale', 'getSpace', 'getConfiguration', 'emit']);
    });
    it('should call |getContextId|', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // THEN
      expect(spied.getContextId).toHaveBeenCalled();
    });
    it('should call |getClientId|', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // then
      expect(spied.getClientId).toHaveBeenCalled();
    });
    it('should call |getLocale|', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // then
      expect(spied.getLocale).toHaveBeenCalled();
    });
    it('should call |getSpace|', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // then
      expect(spied.getSpace).toHaveBeenCalled();
    });
    it('should call |getConfiguration|', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // then
      expect(spied.getConfiguration).toHaveBeenCalled();
    });
    it('should call |Local.saml.load| as saml is enable in configuration', async () => {
      // GIVEN
      const mockLocalSamlLoad = jest.spyOn(Local.saml, 'load');
      const c = new ConfigurationFixture();
      c.enableSaml();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());

      // WHEN
      await dydu.exportConversation();

      // then
      expect(mockLocalSamlLoad).toHaveBeenCalled();
      jestRestoreMocked([mockLocalSamlLoad]);
    });
    it('should contains saml info in data form url when saml is enable in configuration', async () => {
      // GIVEN
      const samlValue = 'saml-value';
      const mockLocalSamlLoad = jest.spyOn(Local.saml, 'load');
      mockLocalSamlLoad.mockReturnValue(samlValue);

      const c = new ConfigurationFixture();
      c.enableSaml();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());

      // WHEN
      await dydu.exportConversation();

      // then
      const dataParamPosition = 2;
      const effectiveParam = mockFnGetParamValueAtPosition(spied.emit, dataParamPosition);
      const samlInfoPayloadFormUrl = `saml2_info=${samlValue}`;
      expect(strContains(effectiveParam, samlInfoPayloadFormUrl)).toEqual(true);
      jestRestoreMocked([mockLocalSamlLoad]);
    });
    it('should call |emit| with chat/talk as path parameter', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
      const expectedPath = 'chat/talk';
      const paramPosition = 1;
      const effectiveParam = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(strContains(effectiveParam, expectedPath)).toEqual(true);
    });
    it('should call |emit| with form url encoded as payload parameter', async () => {
      // GIVEN
      // WHEN
      await dydu.exportConversation();

      // THEN
      expect(spied.emit).toHaveBeenCalled();
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(isUrlFormEncoded(effectivePayloadParameterValue)).toEqual(true);
    });
    it('should include the text argument in the payload', async () => {
      // GIVEN
      const text = 'text-value';

      // WHEN
      await dydu.exportConversation(text);

      // THEN
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(strContains(effectivePayloadParameterValue, text)).toEqual(true);
    });
    it('should match payload with schema', async () => {
      const schemaPayload = {
        clientId: '',
        language: '',
        qualificationMode: '',
        space: '',
        userInput: '',
        solutionUsed: '',
      };
      const schemaKeyList = Object.keys(schemaPayload);

      // WHEN
      await dydu.exportConversation();

      // THEN
      const paramPosition = 2;
      const effectivePayloadParameterValue = mockFnGetParamValueAtPosition(spied.emit, paramPosition);
      expect(schemaKeyList.every((key) => strContains(effectivePayloadParameterValue, key))).toEqual(true);
    });
    it("should contains contextId in path if it's defined", async () => {
      // GIVEN
      const contextId = 'defined-contextid';
      spied.getContextId.mockResolvedValue(contextId);

      // WHEN
      await dydu.exportConversation();

      // THEN
      const pathParamPosition = 1;
      const effectiveParamValue = mockFnGetParamValueAtPosition(spied.emit, pathParamPosition);
      expect(strContains(effectiveParamValue, contextId)).toEqual(true);
    });
  });

  describe('setLastResponse', function () {
    it('should set class attribute |lastResponse|', () => {
      // GIVEN
      const lastResponse = { response: true };

      // WHEN
      dydu.setLastResponse(lastResponse);

      // THEN
      expect(dydu.lastResponse).toEqual(lastResponse); // reference comparison
    });
    it('should return value', () => {
      // GIVEN
      const lastResponse = { response: true };

      // WHEN
      const value = dydu.setLastResponse(lastResponse);

      // THEN
      expect(value).toEqual(lastResponse); // reference comparison
    });
  });

  describe('emit', () => {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, [
        'handleSetApiUrl',
        'handleSetApiTimeout',
        'setLastResponse',
        'handleAxiosResponse',
        'handleAxiosError',
      ]);
    });
    it('should call |handleSetApiUrl|', async () => {
      // GIVEN
      const verb = jest.fn().mockResolvedValue({ data: true });
      const path = 'path/to/ressource';
      const data = 'data=true&formurl=true';
      const params = [verb, path, data];

      // WHEN
      await dydu.emit(...params);

      // THEN
      expect(spied.handleSetApiUrl).toHaveBeenCalled();
    });
    it('should call |handleSetApiTimeout|', async () => {});

    describe('handleAxiosError', function () {
      const getDefaultParams = () => [{}, {}, '', {}, 1];
      let params = getDefaultParams();

      beforeEach(() => {
        spied = jestSpyOnList(dydu, ['handleTokenRefresh', 'emit']);
        params = getDefaultParams();
      });

      afterEach(() => {
        spied = jestSpyOnList(dydu, ['handleTokenRefresh', 'emit']);
        params = getDefaultParams();
      });

      it('should call |handleTokenRefresh| as the argument response, satus is 401', async () => {
        // GIVEN
        const error = { response: { status: 401 } };

        // WHEN
        params[0] = error;
        await dydu.handleAxiosError(...params);

        // THEN
        //expect(spied.handleTokenRefresh).toHaveBeenCalled();
      });
      it('should call |emit|', () => {});
    });
  });
  describe('samlRenewnOrReject', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['redirectAndRenewAuth', 'renewAuth']);
    });
    it("should call |redirectAndRenewAuth| as type is 'SAML_redirection'", () => {
      // GIVEN
      const param = {
        type: 'SAML_redirection',
        values: {},
      };

      // WHEN
      dydu.samlRenewOrReject(param);

      // THEN
      expect(spied.redirectAndRenewAuth).toHaveBeenCalled();
    });
    it('should call |renewAuth|', () => {
      // GIVEN
      const param = {
        type: '',
        values: {},
      };

      // WHEN
      dydu.samlRenewOrReject(param);

      // THEN
      expect(spied.renewAuth).toHaveBeenCalled();
    });
  });

  describe('redirectAndRenewAuth', function () {
    let savedWinLoc = global.window.location;
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['renewAuth']);
    });
    afterEach(() => {
      window.location = savedWinLoc;
    });

    it('should call |renewAuth| with values.auth', () => {
      // GIVEN
      const param = { auth: 1 };

      // WHEN
      dydu.redirectAndRenewAuth(param);

      // THEN
      expect(spied.renewAuth).toHaveBeenCalledWith(param.auth);
    });
    it("should update window.location.href with 'RelayState' in url parameter", () => {
      // GIVEN
      delete global.window.location;
      global.window = Object.create(window);
      global.window.location = {};
      // WHEN
      dydu.redirectAndRenewAuth({ auth: 1 });

      // THEN
      expect(strContains(window.location.href, 'RelayState=')).toEqual(true);
    });
  });

  describe('renewAuth', function () {
    it('should call |Local.saml.save|', () => {
      // GIVEN
      const authParam = {};

      // WHEN
      dydu.renewAuth(authParam);

      // THEN
      expect(Local.saml.save).toHaveBeenCalled();
    });
  });

  describe('handleTokenRefresh', function () {
    beforeEach(() => {
      spied = jestSpyOnList(dydu, ['getConfiguration']);
      const c = new ConfigurationFixture();
      c.enableOidc();
      spied.getConfiguration.mockReturnValue(c.getConfiguration());
    });
    it('should call |getConfiguration|', () => {
      // GIVEN
      dydu.tokenRefresher = jest.fn();
      dydu.oidcLogin = jest.fn();
      // WHEN
      dydu.handleTokenRefresh();

      // THEN
      expect(spied.getConfiguration).toHaveBeenCalled();
    });
    it('should call |tokenRefresher|', () => {
      // GIVEN
      const loadTokenMock = jest.spyOn(Storage, 'loadToken');
      loadTokenMock.mockReturnValue({ refresh_token: true });
      dydu.tokenRefresher = jest.fn();

      // WHEN
      dydu.handleTokenRefresh();

      // THEN
      expect(dydu.tokenRefresher).toHaveBeenCalled();
    });
    it('should call |oidcLogin|', () => {
      // GIVEN
      const loadTokenMock = jest.spyOn(Storage, 'loadToken');
      loadTokenMock.mockReturnValue({ refresh_token: null });
      dydu.tokenRefresher = jest.fn();
      dydu.oidcLogin = jest.fn();

      // WHEN
      dydu.handleTokenRefresh();

      // THEN
      expect(dydu.oidcLogin).toHaveBeenCalled();
      jestRestoreMocked([loadTokenMock, dydu.tokenRefresher, dydu.oidcLogin]);
    });
  });

  describe('initInfo', function () {
    it('should initialize the |infos| class attribue', () => {
      // GIVEN
      dydu.infos = null;

      // WHEN
      dydu.initInfos();

      // THEN
      expect(dydu.infos).toBeTruthy();
      const expectedKeys = ['locale', 'space', 'botId'];
      Object.keys(dydu.infos).forEach((key) => {
        expect(expectedKeys.includes(key)).toEqual(true);
      });
    });
  });

  describe('alreadyCame', function () {
    it('should call |Local.clientId.getKey|', () => {});
    it('should call |Local.clientId.getKey| with currentInfo', () => {});
    it('should call |Local.clientId.isSet|', () => {});
  });

  describe('class attributes initialisation', function () {
    it('should correctly initialize attributes', () => {
      const __dydu = jest.requireActual(dyduRelativeLocation).default;
      const expected = {
        mainServerStatus: 'Ok',
        triesCounter: 0,
        maxTries: 3,
        minTimeoutForAnswer: secondsToMs(3),
        maxTimeoutForAnswer: secondsToMs(30),
        qualificationMode: false,
      };

      Object.keys(expected).forEach((key) => {
        expect(__dydu[key] === expected[key]).toEqual(true);
      });
    });
  });
});

const jestSpyOnList = (obj, methodNameList) => {
  return methodNameList.reduce(
    (mapRes, methodName) => ({
      ...mapRes,
      [methodName]: jest.spyOn(obj, methodName).mockReturnValue(null),
    }),
    {},
  );
};

const jestRestoreMocked = (spies) => {
  const spyRestore = (s) => s.mockRestore();
  try {
    spies.forEach(spyRestore);
  } catch (e) {
    Object.values(spies).forEach(spyRestore);
  }
};

const isUrlFormEncoded = (s) => strContains(s, '=');
const mockFnGetParamValueAtPosition = (mockFn, paramPosition, callNum = 0) => mockFn.mock.calls[callNum][paramPosition];
