declare namespace Servlet {
  export type ChatResponseType =
    | Base64
    | 'talkResponse'
    | 'DMUnderstoodQuestion'
    | 'GBMisunderstoodQuestion'
    | 'DMDisabledKnowledge'
    | 'RWOneReword'
    | 'DMRewordClickedAuto';
  export type ChatResponseFeedbackType = 'positive' | 'negative' | 'withoutAnswer';

  export interface ChatResponseValues {
    guiAction?: Base64 | string;
    contextId?: Base64 | string;
    language?: Base64 | string;
    hasProfilePicture?: boolean;
    keepPopinMinimized?: boolean;
    askFeedback?: boolean;
    knowledgeId?: number;
    actionId?: number;
    serverTime?: number;
    botId?: Base64 | string;
    text?: Base64 | string;
    startLivechat?: boolean;
    human?: boolean;
    enableAutoSuggestion?: boolean;
    feedback?: ChatResponseFeedbackType;
    sidebar?: boolean;
    templateData?: Base64 | string;
    templateName?: Base64 | string;
    urlRedirect?: Base64 | string;
    nextStepResponse?: any;
    date?: Date;
    from?: string;
    type?: ChatResponseType;
    typeResponse?: ChatResponseType;
    user?: string;
    nextStepResponse?: any;
  }

  export interface ChatResponse {
    values: ChatResponseValues;
    type: ChatResponseType;
  }
}
