import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'react-jss';
import styles from  './styles';
import Avatar from  '../Avatar';
import Bubble from  '../Bubble';
import Loader from  '../Loader';
import { DialogContext } from  '../../contexts/DialogContext';
import Configuration from  '../../tools/configuration';
import sanitize from  '../../tools/sanitize';


const { avatar: AVATAR={}, loader: LOADER } = Configuration.get('interaction');
const DELAYS = (Array.isArray(LOADER) ? LOADER : [LOADER]).map(it => it === true ? 1000 : ~~it);
const SECONDARY_AUTOMATIC = !!Configuration.get('secondary.automatic');


class Interaction extends React.PureComponent {

  static contextType = DialogContext;

  static propTypes = {
    classes: PropTypes.object.isRequired,
    secondary: PropTypes.object,
    secondaryOpen: PropTypes.bool,
    text: PropTypes.string.isRequired,
    thinking: PropTypes.bool,
    type: PropTypes.oneOf(['request', 'response']).isRequired,
  };

  state = {bubbles: [], length: 0};

  addBubble = (bubbles, callback, index=0) => {
    if (this.props.thinking) {
      setTimeout(function() {
        this.setState(
          state => ({bubbles: [...state.bubbles, bubbles.shift()]}),
          () => bubbles.length ? this.addBubble(bubbles, callback, index + 1) : callback(),
        );
      }.bind(this), DELAYS[index % DELAYS.length]);
    }
    else {
      this.setState(({bubbles: bubbles}), callback);
    }
  };

  addSecondary = () => {
    const { content, title } = this.props.secondary || {};
    if (content) {
      this.context.toggleSecondary(
        this.props.secondaryOpen && SECONDARY_AUTOMATIC,
        {body: sanitize(content), title},
      )();
    }
  };

  mount = () => {
    const bubbles = sanitize(this.props.text).split('<hr>');
    this.setState(
      ({length: bubbles.length}),
      () => this.addBubble(bubbles, this.addSecondary),
    );
  };

  componentDidMount() {
    this.mount();
  }

  render() {
    const { toggleSecondary } = this.context;
    const { classes, secondary, type } = this.props;
    const { bubbles, length } = this.state;
    return (
      <div className={classNames(
        'dydu-interaction', `dydu-interaction-${type}`, classes.base, classes[type],
      )} ref={node => this.node = node}>
        {!!AVATAR[type] && <Avatar type={type} />}
        <div className={classNames('dydu-interaction-bubbles', classes.bubbles)}>
          {bubbles.map((it, index) => {
            const actions = secondary ? [{action: toggleSecondary(), text: 'Plus'}] : [];
            return <Bubble actions={actions} html={it} key={index} type={type} />;
          })}
          {bubbles.length < length && <Loader />}
        </div>
      </div>
    );
  }
}


export default withStyles(styles)(Interaction);
