import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ManualGameElementContent from './../components/ManualGameElementContent.jsx';

const sampleContent = "<div>Sample content from db</div>";

export const composer = ({ context }, onData) => {
  const { LocalState } = context();
  const elementId = LocalState.get('SELECTED_ELEMENT_ID');
  // use elementID to subscribe content from element
  onData(null, {
    elementDetail: {
      content: sampleContent
    },
    elementId
  });
};

export const depsMapper = (context, actions) => ({
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ManualGameElementContent);
