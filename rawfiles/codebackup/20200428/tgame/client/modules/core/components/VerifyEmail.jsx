import React from 'react';

export default class VerifyEmail extends React.Component {
  componentDidMount() {
    const { verifyEmail, history, token } = this.props;

    verifyEmail(token, history);
  }

  render() {
    const { text } = this.props;

    return (
      <h2 className="verifying-email">{text}</h2>
    );
  }
}
