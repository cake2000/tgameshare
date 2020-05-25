import React from "react";
import {Helmet} from "react-helmet";

class ScratchGUI extends React.Component {
  render () {
    return (
        <div className="scratchgui">
          <iframe style={{width: '100%', height: '600px', marginTop: '20px'}} src="/scratch/index.html"/>
            {/* <Helmet>
              <script type="text/javascript" src="../../../../node_modules/scratch/dist/lib.min.js">
              </script>
              <script type="text/javascript" src="../../../../node_modules/scratch/dist/chunks/gui.js"></script>
            </Helmet> */}
            
        </div>
    );
  }
};


export default ScratchGUI;
