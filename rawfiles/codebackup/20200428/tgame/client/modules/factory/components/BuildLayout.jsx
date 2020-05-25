import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import '../../../../node_modules/react-grid-layout/css/styles.css';
import '../../../../node_modules/react-resizable/css/styles.css';

const ReactGridLayout = WidthProvider(RGL);

class NoDraggingLayout extends React.PureComponent {
  static defaultProps = {
    className: 'layout',
    isDraggable: false,
    isResizable: false,
    items: 50,
    cols: 12,
    onLayoutChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      rowHeight: (window.innerHeight - 73) / 12, // 190
    };

    this.handleResize = () => {
      if (this.unmount === true) {
        this.setState({
          rowHeight: (window.innerHeight - 73) / 12,
        });
      }
    };
    window.addEventListener('resize', this.handleResize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  componentWillUnMount() {
    window.removeEventListener('resize', this.handleResize);
    this.unmount = true;
  }

  render() {
    return (
      <ReactGridLayout
        rowHeight={this.state.rowHeight}
        margin={[0, 0]}
        layout={this.props.layout}
        onLayoutChange={this.onLayoutChange}
        draggableCancel="input,textarea,.CodeMirror,.chatHistory__List__Item__Line__Content"
        {...this.props}
      >
        {this.props.children}
      </ReactGridLayout>
    );
  }
}
export default NoDraggingLayout;
