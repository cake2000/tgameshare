import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '640px',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    display: 'flex',
    padding: '0px',
    alignItems: 'center'
  }
};

class ImageZoom extends Component {
  state = {
    isZoomed: false
  }

  showBiggerPhoto = () => {
    this.setState({ isZoomed: true });
  }

  showNormalPhoto = () => {
    this.setState({ isZoomed: false });
  }

  render() {
    const { isZoomed } = this.state;
    const { image, zoomImage } = this.props;

    return (
      <div className="images-tools" onClick={this.showBiggerPhoto} role="presentation">
        <img src={image.src} alt={image.alt} className={`image-normal ${image.className}`} />
        <Modal
          style={StyleModal}
          isOpen={isZoomed}
          onRequestClose={this.showNormalPhoto}
          contentLabel="Modal"
        >
          <div className="image-zoomed" onClick={this.showNormalPhoto} role="presentation">
            <img src={zoomImage.src} alt={zoomImage.alt} />
          </div>
        </Modal>
      </div>
    );
  }
}

ImageZoom.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    className: PropTypes.string
  }).isRequired,
  zoomImage: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    className: PropTypes.string
  }).isRequired
};

export default ImageZoom;
