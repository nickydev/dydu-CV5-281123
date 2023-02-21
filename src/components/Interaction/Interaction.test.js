import { ContextQuery, contextName } from '../../setupTests';

import Interaction from './index';
import { render } from '../../tools/test-utils';

jest.mock('../../contexts/DialogContext', () => ({
  useDialog: jest.fn().mockReturnValue({ startAnimationOperatorWriting: false }),
}));

xdescribe('Interaction', function () {
  describe('Writing', function () {
    it('should show loader', function () {
      const { debug } = render(<Interaction.Writing />, { configuration: { application: { open: true } } });
      debug();
    });

    it('should show loader', function () {
      const contextList = [
        ContextQuery.make(contextName.configurationContext),
        ContextQuery.make(contextName.dialogContext, { startAnimationOperatorWriting: false }),
      ];

      const { debug } = render(<Interaction.Writing />, { contexts: contextList });
      debug();
    });
  });
});
