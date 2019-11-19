import c from 'classnames';
import React, { useContext, useState } from 'react';
import { ConfigurationContext } from '../../contexts/ConfigurationContext';
import { DialogContext } from '../../contexts/DialogContext';
import dydu from '../../tools/dydu';
import Bubble from '../Bubble';
import Button from '../Button';
import Scroll from '../Scroll';
import useStyles from './styles';



/**
 * Render handles for the user to submit feedback.
 *
 * The component contains two buttons: positive and negative.
 */
export default function Feedback() {

  const { configuration } = useContext(ConfigurationContext);
  const { addResponse } = useContext(DialogContext);
  const [ comment, setComment ] = useState('');
  const [ showComment, setShowComment ] = useState(false);
  const [ showVote, setShowVote ] = useState(true);
  const [ thinking, setThinking ] = useState(false);
  const classes = useStyles();
  const { askComment, commentHelp='', commentThanks='', voteThanks='' } = configuration.feedback;

  const onChange = event => {
    setComment(event.target.value);
  };

  const onComment = () => {
    const value = comment.trim();
    if (value.length) {
      setThinking(true);
      dydu.feedbackComment(value).then(() => setTimeout(() => {
        setComment('');
        setShowComment(false);
        setThinking(false);
        if (commentThanks) {
          addResponse({text: commentThanks});
        }
      }, 1000));
    }
  };

  const onKeyDown = event => {
    if (event.keyCode === 13 && !event.defaultPrevented) {
      event.preventDefault();
      onComment();
    }
  };

  const onVoteNegative = () => {
    dydu.feedback(false).then(() => {
      setShowVote(false);
      if (askComment) {
        setShowComment(true);
      }
      else if (voteThanks) {
        addResponse({text: voteThanks});
      }
    });
  };

  const onVotePositive = () => {
    dydu.feedback(true).then(() => {
      setShowVote(false);
      if (voteThanks) {
        addResponse({text: voteThanks});
      }
    });
  };

  return (
    <div className="dydu-feedback">
      {showVote && (
        <div className={c('dydu-feedback-vote', classes.vote)}>
          <Button color="error" filled onClick={onVoteNegative} variant="icon">
            <img alt="Negative feedback" src="icons/thumb-down.png" title="Negative feedback" />
          </Button>
          <Button color="success" filled onClick={onVotePositive} variant="icon">
            <img alt="Positive feedback" src="icons/thumb-up.png" title="Positive feedback" />
          </Button>
        </div>
      )}
      {showComment && (
        <Bubble component={Scroll} thinking={thinking} type="response">
          <form className="dydu-feedback-comment" onSubmit={onComment}>
            {commentHelp && <p children={commentHelp} className="dydu-feedback-comment-help" />}
            <div className={c('dydu-feedback-comment-field', classes.commentField)}>
              <textarea autoFocus
                        className={c(classes.commentFieldText, {[classes.thinking]: thinking})}
                        disabled={thinking}
                        maxLength={100}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder="Comment here..."
                        value={comment} />
              <div children={comment} className={classes.commentFieldShadow} />
            </div>
          </form>
        </Bubble>
      )}
    </div>
  );
}
