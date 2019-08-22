import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'react-jss';
import styles from './styles';
import Chatbox from '../Chatbox';
import Teaser from '../Teaser';
import Configuration from '../../tools/configuration';
import { Local } from '../../tools/storage';


/**
 * Entry point of the application. Either render the chatbox or the teaser.
 */
class Application extends React.PureComponent {

  static propTypes = {
    /** @ignore */
    classes: PropTypes.object.isRequired,
  };

  state = {open: false};

  /**
   * Toggle between Teaser and Chatbox views.
   *
   * @param {boolean} [open]
   * @public
   */
  toggle = open => () => {
    open = open === undefined ? !this.state.open : !!open;
    this.setState(
      {open: open},
      () => Local.set(Local.names.open, open),
    );
  };

  componentDidMount() {
    const open = !!Local.get(Local.names.open);
    this.toggle(open === undefined ? !!Configuration.get('application.open') : open)();
  }

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    return (
      <div className={classNames('dydu-application', classes.root)}>
        <Chatbox open={open} toggle={this.toggle} />
        <Teaser open={!open} toggle={this.toggle} />
      </div>
    );
  }
}


export default withStyles(styles)(Application);
