import cookie from 'js-cookie';


export default class Cookie {

  static cookies = {
    client: 'dydu.client.id',
    context: 'dydu.context.id',
    onboarding: 'dydu.onboarding',
    open: 'dydu.open',
  };

  static duration = {
    long: {expires: 365},
    short: {expires: 1 / 24 / 60 * 10},
  };

  static get = cookie.getJSON;
  static set = cookie.set;
}
