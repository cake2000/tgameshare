import { useDeps, composeAll } from 'mantra-core';
import GeneralModal from '../components/GeneralModal/GeneralModal.jsx';

const defaultModalInfo = {
  content: 'Your content is null',
  title: 'Title here',
  okAction: () => null,
  cancelAction: () => null,
  showModal: false
};

export const depsMapper = (context, actions) => {
  const { LocalState } = context;
  const generalModalInfo = LocalState.get('GENERAL_MODAL_INFO');
  const modalInfo = generalModalInfo || defaultModalInfo;
  const {
    content, title, okBtnLabel, cancelBtnLabel, showModal
  } = modalInfo;

  return ({
    closeGeneralModal: actions.generalModal.closeModal,
    content,
    title,
    okBtnLabel,
    cancelBtnLabel,
    showModal,
  });
};

export default composeAll(
  useDeps(depsMapper)
)(GeneralModal);
