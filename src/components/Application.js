import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'react-jss';
import Chatbox from './Chatbox';
import Teaser from './Teaser';
import Configuration from '../tools/configuration';
import Cookie from '../tools/cookie';


const styles = {
  root: {
    fontFamily: 'sans-serif',
  },
};


class Application extends React.PureComponent {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  state = {open: false};

  toggle = open => () => {
    open = open === undefined ? !this.state.open : !!open;
    this.setState(
      {open: open},
      () => Cookie.set(Cookie.cookies.open, open, Cookie.duration.long),
    );
  };

  componentDidMount() {
    const open = !!Cookie.get(Cookie.cookies.open);
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
