import React from 'react';

const NotificationAngle = ({ isNotiShow }) => (
  <div className={`noti-angle ${isNotiShow ? '' : 'hide'}`} />
);

export default NotificationAngle;
