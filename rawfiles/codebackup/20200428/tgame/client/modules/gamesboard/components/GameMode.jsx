import React from 'react';
import PropTypes from 'prop-types';

class GameMode extends React.Component {
  static propTypes = {
    opponents: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectOpponent: PropTypes.func.isRequired,
    selectGame: PropTypes.func.isRequired,
    history: PropTypes.shape().isRequired
  }

  static defaultProps = {
    opponents: []
  };

  renderFriendIcon = () => (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 321.6 96.8"
      style={{ enableBackground: 'new 0 0 321.6 96.8' }}
      xmlSpace="preserve"
      className="opponent__info__image"
    >
      <g>
        <g>
          <line className="st0" x1="200.1" y1="59.6" x2="201.1" y2="59.9" />
          <line className="st1" x1="202.9" y1="60.6" x2="269.3" y2="83.7" />
          <line className="st0" x1="270.2" y1="84.1" x2="271.2" y2="84.4" />
        </g>
      </g>
      <g>
        <g>
          <line className="st0" x1="127.2" y1="59.6" x2="126.2" y2="59.9" />
          <line className="st1" x1="124.4" y1="60.6" x2="58" y2="83.7" />
          <line className="st0" x1="57.1" y1="84.1" x2="56.1" y2="84.4" />
        </g>
      </g>
      <g>
        <path className="st2" d="M179,40.8c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.2-0.3-0.4-0.3-0.7l0-0.2c0-0.1,0-0.2,0-0.3V23.9c0-0.5,0.4-1,1-1c5,0,9,4,9,8.9C188.1,36.8,184,40.8,179,40.8L179,40.8z M180,38.8l0.7-0.2c3.2-0.8,5.4-3.6,5.4-6.8s-2.2-6-5.4-6.8l-0.7-0.2V38.8z" />
        <path className="st2" d="M144.8,40.8c-5,0-9-4-9-8.9c0-4.9,4-8.9,9-8.9c0.5,0,1,0.4,1,1v15.4c0,0.1,0,0.2,0,0.2l0,0.3c0,0.3-0.1,0.5-0.3,0.7C145.3,40.7,145.1,40.8,144.8,40.8L144.8,40.8z M143.1,25.1c-3.2,0.8-5.4,3.6-5.4,6.8c0,3.2,2.2,6,5.4,6.8l0.7,0.2V24.9L143.1,25.1z" />
        <path className="st3" d="M170.2,37.9c0,0,0.3,5.9-8.3,5.9h0c-8.6,0-8.3-5.9-8.3-5.9H170.2z" />
        <path className="st2" d="M146.2,70.5c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.2-0.3-0.5-0.3-0.7c0.6-7,5.7-12.8,12.5-14.5c0.1,0,0.2,0,0.2,0c0.2,0,0.4,0.1,0.6,0.2c0.2,0.2,0.4,0.5,0.4,0.8v1c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9v-1c0-0.3,0.1-0.6,0.4-0.8c0.2-0.1,0.4-0.2,0.6-0.2c0.1,0,0.2,0,0.2,0c6.9,1.7,11.9,7.6,12.5,14.5c0,0.3-0.1,0.5-0.3,0.7c-0.2,0.2-0.4,0.3-0.7,0.3H146.2zM156.4,57.4c-4.6,1.8-7.9,5.7-8.9,10.5l-0.1,0.7h29.2l-0.1-0.7c-1-4.8-4.4-8.7-8.9-10.5l-0.6-0.2l-0.1,0.6c-0.4,2.3-2.4,3.9-4.8,3.9c-2.3,0-4.3-1.6-4.8-3.9l-0.1-0.6L156.4,57.4z" />
        <path className="st2" d="M161.9,61.7c-2.7,0-4.9-2.2-4.9-4.8v-4.5c0-0.5,0.4-1,1-1h7.7c0.5,0,1,0.4,1,1v4.5c0,1.3-0.5,2.5-1.4,3.4C164.4,61.2,163.2,61.7,161.9,61.7z M159,56.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9v-3.5H159V56.9z" />
        <path className="st2" d="M158,53.4c-7.9,0-14.3-6.3-14.3-14.1V20.3c0-3.1,1-6.1,2.9-8.6c0.2-0.2,0.5-0.4,0.8-0.4c0.4,0,0.7,0.2,0.9,0.5c1.2,2.3,3.5,3.7,6.2,3.7c0.5,0,1.2,0,2,0l0.2,0c1.3,0,2.9-0.1,4.6-0.1c6.7,0,16,0.6,18.4,5.7c0.2,0.2,0.2,0.4,0.2,0.6v17.4c0,3.8-1.5,7.3-4.2,10c-2.7,2.7-6.3,4.1-10.1,4.1H158z M147.1,14.8c-0.9,1.7-1.3,3.6-1.3,5.5v18.9c0,6.7,5.5,12.2,12.3,12.2h7.7c6.8,0,12.3-5.5,12.3-12.2V22.1L178,22c-1.5-3-7.1-4.5-16.6-4.5c-1.7,0-3.2,0-4.5,0.1l-0.2,0c-0.8,0-1.5,0-2,0c-2.6,0-5-1-6.7-2.8l-0.5-0.6L147.1,14.8z" />
        <path className="st2" d="M173,29.9c-0.3-1.2-1.5-2.1-2.8-2.1c-1.3,0-2.5,0.9-2.8,2.1h-1.6c0.4-2.1,2.2-3.6,4.4-3.6c2.2,0,4,1.6,4.4,3.6H173z" />
        <path className="st2" d="M156.5,29.9c-0.3-1.2-1.5-2.1-2.8-2.1c-1.3,0-2.5,0.9-2.8,2.1h-1.6c0.4-2.1,2.2-3.6,4.4-3.6c2.2,0,4,1.6,4.4,3.6H156.5z" />
        <path className="st2" d="M156.9,52c-6.3,0-11.5-4.9-11.7-11.2c0-0.4-0.2-0.8-0.5-1.1c-0.3-0.3-0.7-0.4-1.1-0.4c-2,0-3.8-0.9-5.1-2.5c-0.4-0.5-1.1-0.7-1.8-0.5c-0.6,0.3-1,0.9-1,1.6c0.6,5.8,1.4,9.7,2.5,11.9c2.2,4.8-1.2,9.5-2.3,10.2c-0.5,0.1-0.9,0.4-1.2,0.9c-0.3,0.5-0.2,1.2,0.2,1.6c0.1,0.1,2.9,3.3,7.5,3.3c0,0,0,0,0,0c2.4,0,4.8-0.9,7.2-2.7c0.1-0.1,0.2-0.1,0.2-0.2c1.9-2.2,4.4-3.8,7.3-4.5c0.7-0.2,1.2-0.8,1.2-1.5v-3.5C158.5,52.7,157.8,52,156.9,52z" />
        <path className="st2" d="M189,60.9c-0.2-0.5-0.7-0.8-1.2-0.9c-1-0.6-4.5-5.4-2.3-10.2c1-2.2,1.8-6.1,2.5-11.9c0.1-0.7-0.3-1.3-1-1.6c-0.6-0.3-1.4-0.1-1.8,0.5c-1.2,1.6-3.1,2.5-5.1,2.5c-0.4,0-0.8,0.1-1.1,0.4c-0.3,0.3-0.5,0.7-0.5,1.1c-0.3,6.3-5.4,11.2-11.7,11.2c-0.8,0-1.5,0.7-1.5,1.5V57c0,0.7,0.5,1.3,1.2,1.5c2.8,0.7,5.4,2.3,7.3,4.5c0.1,0.1,0.1,0.2,0.2,0.2c2.4,1.8,4.8,2.7,7.2,2.7c4.5,0,7.4-3.2,7.5-3.3C189.1,62.1,189.2,61.5,189,60.9z" />
        <path className="st2" d="M187.1,5.5c-2.9-3.6-8.6-5.5-16.8-5.5c-10,0-15.7,0.1-19.1,0.9c-3.6,0.9-5.1,2.6-5.1,6.1c0,5.7,4.2,10,9.7,10c0.6,0,1.4,0,2.2,0c1.3,0,2.8-0.1,4.5-0.1c11.5,0,15.1,2.3,16.1,4.2v1.7c0,0.8,0.7,1.5,1.5,1.5c2.3,0,4.5,1.3,5.7,3.3c0.3,0.5,0.8,0.8,1.3,0.8c0.1,0,0.2,0,0.3,0c0.7-0.2,1.1-0.7,1.2-1.4c0.4-6.7,0.4-12.5,0.4-14.3C189.2,11.9,189.6,8.6,187.1,5.5z" />
        <path className="st2" d="M147.8,11.7c-0.3-0.6-0.6-1.3-0.7-2.1c-0.1-0.7-0.8-1.3-1.5-1.3c-8.8,0-10.2,4.7-10.4,6.8c0,0,0,0.1,0,0.1V28c0,0.7,0.5,1.3,1.1,1.5c0.1,0,0.3,0,0.4,0c0.5,0,1.1-0.3,1.3-0.8c1.1-2,3.3-3.3,5.7-3.3c0.8,0,1.5-0.7,1.5-1.5v-3.6c0-2.6,0.8-5,2.4-7.1C148,12.8,148,12.2,147.8,11.7z" />
      </g>
      <g>
        <g>
          <g>
            <path className="st2" d="M312.3,65.7c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.2-0.3-0.5-0.3-0.7c0-0.1,0-0.2,0-0.2c0-0.1,0-0.2,0-0.3V48.4c0-0.6,0.5-1,1-1c5.1,0,9.2,4.1,9.2,9.1C321.6,61.6,317.4,65.7,312.3,65.7L312.3,65.7z M313.4,63.7l0.7-0.2c3.2-0.8,5.5-3.6,5.5-6.9c0-3.3-2.3-6.1-5.5-6.9l-0.7-0.2V63.7z" />
            <path className="st2" d="M277.3,65.7c-5.1,0-9.2-4.1-9.2-9.1c0-5,4.1-9.1,9.2-9.1c0.6,0,1,0.5,1,1v15.7c0,0.1,0,0.2,0,0.2c0,0.1,0,0.2,0,0.3c0,0.3-0.1,0.5-0.3,0.7C277.9,65.6,277.6,65.7,277.3,65.7L277.3,65.7z M275.6,49.6c-3.2,0.8-5.5,3.6-5.5,6.9c0,3.3,2.3,6.1,5.5,6.9l0.7,0.2V49.5L275.6,49.6z" />
            <path className="st2" d="M294.8,87.1c-2.7,0-5-2.2-5-4.9v-4.6c0-0.6,0.5-1,1-1h7.9c0.6,0,1,0.5,1,1v4.6C299.8,84.9,297.6,87.1,294.8,87.1z M291.9,82.2c0,1.6,1.3,2.9,2.9,2.9s2.9-1.3,2.9-2.9v-3.6h-5.9V82.2z" />
            <path className="st2" d="M290.9,78.6c-8,0-14.6-6.5-14.6-14.5V45.9c0-0.6,0.5-1,1-1c15.6,0,16.5-8.6,16.5-9c0-0.5,0.5-0.9,1-0.9c0.6,0,1,0.4,1,0.9c0,0.4,0.9,9,16.5,9c0.6,0,1,0.5,1,1v18.2c0,8-6.5,14.5-14.6,14.5H290.9z M294.4,40.1c-1.8,2.9-6,6.5-15.5,6.8l-0.5,0v17.2c0,6.9,5.6,12.5,12.6,12.5h7.9c6.9,0,12.6-5.6,12.6-12.5V46.9l-0.5,0c-9.5-0.3-13.7-3.9-15.5-6.8l-0.5-0.7L294.4,40.1z" />
            <path className="st2" d="M304.8,24c-0.3,0-0.5,0-0.6,0h-18.8c-0.1,0-0.3,0-0.6,0c-2.8,0-16.7,0.8-16.7,15.8v12.6c0,0.9,0.7,1.6,1.6,1.6c0.6,0,1.2-0.4,1.4-1c1-2.5,3.4-4.1,6.1-4.1c0.9,0,1.6-0.7,1.6-1.6v-1c9.7-0.4,14-4,16-7.1c1.9,3.1,6.3,6.7,16,7.1v1c0,0.9,0.7,1.6,1.6,1.6c2.7,0,5.1,1.6,6.1,4.1c0.2,0.6,0.8,1,1.4,1h0c0.9,0,1.6-0.7,1.6-1.6V39.7C321.5,24.7,307.6,24,304.8,24z" />
            <ellipse className="st2" cx="286" cy="52.5" rx="1" ry="1" />
            <ellipse className="st2" cx="304" cy="52.5" rx="1" ry="1" />
          </g>
        </g>
        <path className="st3" d="M303.1,63c0,0,0.3,5.9-8.3,5.9h0c-8.6,0-8.3-5.9-8.3-5.9H303.1z" />
        <path className="st2" d="M279.1,96.8c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.2-0.3-0.5-0.3-0.7c0.6-7,5.7-12.8,12.5-14.5c0.1,0,0.2,0,0.2,0c0.2,0,0.4,0.1,0.6,0.2c0.2,0.2,0.4,0.5,0.4,0.8v1c0,1.6,1.3,2.9,2.9,2.9s2.9-1.3,2.9-2.9v-1c0-0.3,0.1-0.6,0.4-0.8c0.2-0.1,0.4-0.2,0.6-0.2c0.1,0,0.2,0,0.2,0c6.9,1.7,11.9,7.6,12.5,14.5c0,0.3-0.1,0.5-0.3,0.7c-0.2,0.2-0.4,0.3-0.7,0.3H279.1zM289.3,83.7c-4.6,1.8-7.9,5.7-8.9,10.5l-0.1,0.7h29.2l-0.1-0.7c-1-4.8-4.4-8.7-8.9-10.5l-0.6-0.2l-0.1,0.6c-0.4,2.3-2.4,3.9-4.8,3.9c-2.3,0-4.3-1.6-4.8-3.9l-0.1-0.6L289.3,83.7z" />
      </g>
      <g>
        <g>
          <g>
            <path className="st2" d="M47.9,63.2c-0.3,0-0.6-0.1-0.8-0.3c-0.2-0.2-0.3-0.5-0.3-0.8l0-0.3c0-0.1,0-0.2,0-0.3v-17c0-0.6,0.5-1.1,1.2-1.1c5.5,0,10,4.5,10,9.9C58,58.7,53.5,63.2,47.9,63.2L47.9,63.2z M49.1,60.9l0.7-0.2c3.5-0.8,5.9-3.9,5.9-7.5c0-3.5-2.4-6.6-5.9-7.5l-0.7-0.2V60.9z" />
            <path className="st2" d="M10,63.2c-5.5,0-10-4.5-10-9.9c0-5.5,4.5-9.9,10-9.9c0.6,0,1.2,0.5,1.2,1.1v17c0,0.1,0,0.2,0,0.3l0,0.3c0,0.3-0.1,0.6-0.3,0.8C10.7,63.1,10.4,63.2,10,63.2L10,63.2z M8.2,45.8c-3.5,0.8-5.9,3.9-5.9,7.5c0,3.5,2.4,6.6,5.9,7.5l0.7,0.2V45.6L8.2,45.8z" />
            <path className="st2" d="M11.6,96.2c-0.3,0-0.6-0.1-0.9-0.4c-0.2-0.2-0.3-0.6-0.3-0.9c0.7-7.7,6.3-14.2,13.9-16.2c0.1,0,0.2,0,0.3,0c0.3,0,0.5,0.1,0.7,0.2c0.3,0.2,0.4,0.5,0.4,0.9V81c0,1.7,1.4,3.1,3.1,3.1s3.1-1.4,3.1-3.1v-1.1c0-0.3,0.2-0.7,0.4-0.9c0.2-0.2,0.5-0.2,0.7-0.2c0.1,0,0.2,0,0.3,0c7.6,1.9,13.2,8.4,13.9,16.2c0,0.3-0.1,0.6-0.3,0.9c-0.2,0.2-0.5,0.4-0.9,0.4H11.6zM22.9,81.6c-5,2-8.7,6.3-9.9,11.6l-0.1,0.7h32.1l-0.1-0.7c-1.1-5.2-4.8-9.6-9.9-11.6l-0.6-0.2L34.3,82c-0.5,2.5-2.7,4.3-5.3,4.3c-2.6,0-4.8-1.8-5.3-4.3l-0.1-0.6L22.9,81.6z" />
            <path className="st2" d="M29,86.4c-3,0-5.4-2.4-5.4-5.4v-5c0-0.6,0.5-1.1,1.2-1.1h8.6c0.6,0,1.2,0.5,1.2,1.1v5C34.4,84,32,86.4,29,86.4z M25.9,81c0,1.7,1.4,3.1,3.1,3.1s3.1-1.4,3.1-3.1v-3.8h-6.3V81z" />
            <path className="st2" d="M24.7,77.2c-8.7,0-15.8-7-15.8-15.7V40.5c0-8.3,6.5-15.1,14.8-15.7c0,0,0,0,0,0c0.4,0,0.6,0.1,0.9,0.3c0.2,0.2,0.4,0.5,0.4,0.8v10.8c0,2.2,1.8,3.9,3.9,3.9h0.3c2.2,0,3.9-1.8,3.9-3.9V26c0-0.3,0.1-0.6,0.4-0.8c0.2-0.2,0.5-0.3,0.8-0.3c8.4,0.5,14.9,7.4,14.9,15.7v20.9c0,8.7-7.1,15.7-15.8,15.7H24.7z M22,27.4c-6.2,1.3-10.8,6.8-10.8,13.2v20.9c0,7.4,6.1,13.4,13.5,13.4h8.6c7.5,0,13.5-6,13.5-13.4V40.5c0-6.3-4.5-11.9-10.8-13.2l-0.7-0.1v9.5c0,3.4-2.8,6.2-6.2,6.2h-0.3c-3.4,0-6.2-2.8-6.2-6.2v-9.5L22,27.4z" />
            <path className="st2" d="M23.4,49.6h-6.9v-1.8h7.3c0.4,0,0.8,0.3,0.9,0.7c0,0.2,0.3,1.8-0.5,2.8c-0.2,0.3-0.5,0.5-0.9,0.6V49.6z" />
            <path className="st2" d="M41.7,49.6h-6.9v-1.8h7.3c0.4,0,0.8,0.3,0.9,0.7c0,0.2,0.4,1.8-0.5,2.8c-0.2,0.3-0.5,0.5-0.9,0.6V49.6z" />
            <path className="st2" d="M29.2,18.1h-0.3c-3.7,0-6.8,3-6.8,6.7v10.8c0,3.7,3,6.7,6.8,6.7h0.3c3.7,0,6.8-3,6.8-6.7V24.8C35.9,21.1,32.9,18.1,29.2,18.1z" />
          </g>
        </g>
        <path className="st3" d="M37.3,62c0,0,0.3,5.9-8.3,5.9h0c-8.6,0-8.3-5.9-8.3-5.9H37.3z" />
      </g>
    </svg>
  );

  renderSingleIcon = () => (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 82 97.7"
      style={{ enableBackground: 'new 0 0 82 97.7' }}
      xmlSpace="preserve"
      className="opponent__info__image"
    >
      <g>
        <path
          className="st2"
          d="M30.3,52.8H32c0-3.3-2.6-5.9-5.9-5.9s-5.9,2.6-5.9,5.9h1.7c0-2.3,1.9-4.2,4.2-4.2C28.4,48.7,30.3,50.5,30.3,52.8z"
        />
        <path
          className="st2"
          d="M25.5,59.1c0,4,3.3,7.3,7.3,7.3h1.4c4,0,7.3-3.3,7.3-7.3v-2.6h-16V59.1z M26.4,57.4h14.1V59c0,3.5-2.8,6.4-6.4,6.4h-1.4c-3.5,0-6.4-2.8-6.4-6.4v-1.6H26.4z"
        />
        <path
          className="st2"
          d="M59.4,50.8c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9C62.2,52.1,61,50.8,59.4,50.8zM59.4,55.5c-1.1,0-1.9-0.9-1.9-1.9c0-1.1,0.9-1.9,1.9-1.9c1.1,0,1.9,0.9,1.9,1.9C61.3,54.7,60.4,55.5,59.4,55.5z"
        />
        <path
          className="st2"
          d="M79.4,60.6v-1.8c0-2.4-1.9-4.3-4.3-4.3H73v-5.6c0-2.4-1.9-4.3-4.3-4.3h-9.5V31.3c5-1.7,8.6-6.4,8.8-11.9h-9.1c-0.2-0.3-0.5-0.6-0.8-0.8c1.9-3.1,3.1-6.7,3.2-10.5H18.1c0.1,1.3,0.2,2.5,0.5,3.7H5.9c0.1,2.5,0.8,4.9,2,6.9v2.5H2.1c0.2,4.6,2.4,8.6,5.7,11.3v15.4c-2.2,1.7-3.7,4.4-3.7,7.4c0,5.1,4.2,9.3,9.3,9.3h0.7c2.4,4.8,7,8.3,12.4,9.2v1.9H25c-6.7,0-12.2,5.5-12.2,12.2c0,0.3,0,0.7,0.1,1l0.1,0.9h37.2l0,0h18.5c2.4,0,4.3-1.9,4.3-4.3V83h2.1c2.4,0,4.3-1.9,4.3-4.3V77c0-1.5-0.8-2.9-2-3.6c1.2-0.8,2-2.1,2-3.6V68c0-1.5-0.8-2.9-2-3.6C78.6,63.5,79.4,62.1,79.4,60.6z M12.2,61.8c-3-0.6-5.3-3.3-5.3-6.5s2.3-5.9,5.3-6.5V61.8z M14.7,88c0-5.7,4.6-10.4,10.4-10.4h1.6V78c0,3.6,3,6.6,6.6,6.6s6.6-3,6.6-6.6v-0.3H42c1.3,0,2.6,0.3,3.8,0.7v7.2c0,0.9,0.3,1.8,0.8,2.5L14.7,88L14.7,88z M28.5,78v-3.9c0.3,0,0.6,0,0.9,0h8.2c0.1,0,0.2,0,0.3,0V78c0,2.6-2.1,4.7-4.7,4.7S28.5,80.6,28.5,78z M39.8,75.8V74c2.2-0.3,4.2-0.9,6-2v4.4c-1.2-0.4-2.5-0.6-3.8-0.6H39.8z M45.8,48.9v0.6C44.7,48,42.9,47,40.9,47c-3.3,0-5.9,2.6-5.9,5.9h1.7c0-2.3,1.9-4.2,4.2-4.2s4.2,1.9,4.2,4.2h0.7v16c-2.3,1.6-5.1,2.6-8.2,2.6h-8.2c-7.9,0-14.3-6.4-14.3-14.3V35.6c0.8,0.1,1.5,0.2,2.3,0.2c6.1,0,11.4-3.6,13.8-8.8c2.6,1.1,5.5,1.7,8.5,1.7c2,0,3.8-0.3,5.6-0.8c1.8,1.8,4,3.2,6.6,3.7v12.9h-1.8C47.7,44.6,45.8,46.5,45.8,48.9z M70.1,85.6c0,0.8-0.7,1.5-1.5,1.5H50.1c-0.8,0-1.5-0.7-1.5-1.5V48.9c0-0.8,0.7-1.5,1.5-1.5h18.5c0.8,0,1.5,0.7,1.5,1.5v5.6h-3.5c-2.4,0-4.3,1.9-4.3,4.3v1.8c0,1.5,0.8,2.9,2,3.6c-1.2,0.8-2,2.1-2,3.6v1.8c0,1.5,0.8,2.9,2,3.6c-1.2,0.8-2,2.1-2,3.6v1.8c0,2.4,1.9,4.3,4.3,4.3h3.5C70.1,82.9,70.1,85.6,70.1,85.6z M77.5,77v1.8c0,1.3-1.1,2.4-2.4,2.4h-8.5c-1.3,0-2.4-1.1-2.4-2.4V77c0-1.3,1.1-2.4,2.4-2.4h8.5C76.4,74.5,77.5,75.6,77.5,77zM77.5,67.9v1.8c0,1.3-1.1,2.4-2.4,2.4h-8.5c-1.3,0-2.4-1.1-2.4-2.4v-1.8c0-1.3,1.1-2.4,2.4-2.4h8.5C76.4,65.5,77.5,66.5,77.5,67.9z M77.5,60.6c0,1.3-1.1,2.4-2.4,2.4h-8.5c-1.3,0-2.4-1.1-2.4-2.4v-1.8c0-1.3,1.1-2.4,2.4-2.4h8.5c1.3,0,2.4,1.1,2.4,2.4V60.6z"
        />
      </g>
    </svg>
  )

  renderTournamentIcon = () => (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 82 97.7"
      style={{ enableSackground: 'new 0 0 82 97.7' }}
      xmlSpace="preserve"
      className="opponent__info__image"
    >
      <g>
        <rect x="19.7" y="81.3" className="st2" width="42.5" height="8.7" />
        <rect x="26" y="71" className="st2" width="30" height="8.7" />
        <path
          className="st2"
          d="M67,8.6h-9h-1.4H25.4H24h-9.1c-0.8,0-1.4,0.6-1.4,1.4v16.4c0,6.4,5,11.5,11.3,11.8c2.1,6.4,7.9,11.2,14.811.7c0,0,0,0,0,0.1v13.7c0,0,0,0,0,0.1c-4.4,0.4-7.8,2.9-7.8,5.8h18.3c0-2.9-3.4-5.4-7.8-5.8c0,0,0,0,0-0.1V50c0,0,0,0,0-0.1c6.9-0.6,12.7-5.3,14.8-11.7c6.3-0.3,11.2-5.5,11.2-11.8V10C68.4,9.2,67.8,8.6,67,8.6z M24,35.3c-4.4-0.7-7.7-4.4-7.7-9v-15H24C24,11.4,24,35.3,24,35.3z M41,44.9c-6.8,0-12.4-5.5-12.4-12.4v-6.3c0-0.6,0.5-1.1,1.1-1.1s1.1,0.5,1.1,1.1v6.3c0,5.6,4.5,10.1,10.1,10.1c0.6,0,1.1,0.5,1.1,1.1C42.1,44.4,41.6,44.9,41,44.9z M65.6,26.3c0,4.5-3.3,8.3-7.7,9V34c0-0.3,0.1-0.7,0.1-1V11.4h7.7L65.6,26.3L65.6,26.3z"
        />
      </g>
    </svg>

  );

  renderOpponentIcon = (opponent) => {
    const opponentIconList = [
      this.renderSingleIcon(),
      this.renderFriendIcon(),
      this.renderTournamentIcon()
    ];
    return opponentIconList[opponent];
  };

  render() {
    const {
      opponents, gameMode, selectOpponent, isGamePool, selectGame
    } = this.props;

    return (
      <div className={["gameMode", isGamePool ? 'smaller' : 'smaller'].join(' ')} id="game-mode">
        <div className="configure-groups__header gameMode__header">
          <div
            aria-hidden
            className="back-btn"
            onClick={() => selectGame()}
          >
            <i className="fa fa-angle-left" />
            <span> Back</span>
          </div>

          <h1 className="gameMode__header__title">Choose Game Mode</h1>
        </div>
        <div className="gameMode__content">
          {
            opponents.map((item, index) => {
              if (item.name === 'tournament') {
                return null;
              }
              return (
                <div
                  key={item.name}
                  aria-hidden
                  className={`gameMode__content__items gameMode__content__items--${item.name} ${item.name === gameMode && 'active'}`}
                  onClick={() => {
                    selectOpponent(item.link);
                  }}
                >
                  <div className="gameMode__content__items__info">
                    {this.renderOpponentIcon(index)}
                    <div className="gameMode__content__items__title">
                      {item.title}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default GameMode;
