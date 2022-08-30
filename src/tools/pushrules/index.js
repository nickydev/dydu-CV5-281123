import { addRule, getExternalInfos, processRules } from './pushService';

import dydu from '../dydu';

export default function fetchPushrules() {
  return new Promise((resolve, reject) => {
    dydu.pushrules().then((data) => {
      if (Object.keys(data).length > 0) {
        const rules = JSON.parse(data);
        rules.map((rule) => {
          addRule(rule);
        });
        processRules(getExternalInfos(new Date().getTime()));
        if (rules.length > 0) resolve(rules);
        else reject();
      }
    });
  });
}
