import { LivechatProvider, useLivechat } from '../LivechatContext';
import { render, screen } from '@testing-library/react';

import { Local } from '../../tools/storage';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react-hooks';
import { useDialog } from '../DialogContext';
import useDyduPolling from '../../tools/hooks/useDyduPolling';
import useDyduWebsocket from '../../tools/hooks/useDyduWebsocket';
import { useEvent } from '../EventsContext';
import { useSurvey } from '../../Survey/SurveyProvider';

jest.mock('../../Survey/SurveyProvider');
jest.mock('../DialogContext');
jest.mock('../EventsContext');
jest.mock('../../tools/hooks/useDyduPolling');
jest.mock('../../tools/hooks/useDyduWebsocket');

describe('LivechatProvider', () => {
  window.dydu = {
    chat: {
      reply: jest.fn(),
    },
  };
  beforeEach(() => {
    useSurvey.mockReturnValue({
      showSurvey: jest.fn(),
    });
    useDialog.mockReturnValue({
      lastResponse: {},
      displayNotification: jest.fn(),
      showAnimationOperatorWriting: jest.fn(),
      addResponse: jest.fn(),
    });
    useEvent.mockReturnValue({
      onNewMessage: jest.fn(),
    });
    useDyduPolling.mockReturnValue({
      mode: 'polling',
      isAvailable: jest.fn(),
      open: jest.fn(),
      send: jest.fn(),
      onUserTyping: jest.fn(),
    });
    useDyduWebsocket.mockReturnValue({
      mode: 'websocket',
      isAvailable: jest.fn(),
      open: jest.fn(),
      send: jest.fn(),
      onUserTyping: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    const ChildComponent = () => <div>Child Component</div>;
    render(
      <LivechatProvider>
        <ChildComponent />
      </LivechatProvider>,
    );
    expect(screen.getByText('Child Component')).toBeDefined();
  });

  it('should provide livechat context', () => {
    const ChildComponent = () => {
      const { isWebsocket, send, typing, sendSurvey, sendHistory } = useLivechat();
      return (
        <div>
          <span>{isWebsocket.toString()}</span>
          <span>{Local.isLivechatOn.load().toString()}</span>
          <button onClick={() => send('test')}>Send</button>
          <button onClick={() => typing('test')}>Typing</button>
          <button onClick={() => sendSurvey('test')}>Send Survey</button>
          <button onClick={() => sendHistory()}>Send History</button>
        </div>
      );
    };
    render(
      <LivechatProvider>
        <ChildComponent />
      </LivechatProvider>,
    );
    screen.getByRole('button', { name: 'Send' }).click();
    expect(useDyduPolling().send).toBeDefined();
    screen.getByRole('button', { name: 'Typing' }).click();
    screen.getByRole('button', { name: 'Send Survey' }).click();
  });

  it('should call addResponse', () => {
    const { result } = renderHook(() => useLivechat(), {
      wrapper: LivechatProvider,
    });

    const values = "{ text: 'hello' }";

    act(() => {
      result.current.displayResponseText(values);
    });

    expect(useDialog().addResponse).toHaveBeenCalledWith(values);
  });
});
