import React from 'react';
import { DEFAULT_AVATAR } from '../../../../lib/enum';

export default function Avatar({ url, ...restProps }) {
  if (url) {
    return (
      <img className="image-account" src={url} alt={restProps.alt || ''} {...restProps} />
    );
  }

  const currentUser = Meteor.user();

  if (!currentUser) return null;

  const urlUserAvatar = (currentUser.avatar && currentUser.avatar.url) || DEFAULT_AVATAR;

  return (
    <img src={urlUserAvatar} alt={currentUser.username || ''} {...restProps} />
  );
}
