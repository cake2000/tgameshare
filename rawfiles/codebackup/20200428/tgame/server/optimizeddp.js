import { MIGRATION_CONST} from '../lib/enum';
import { ActiveGameList } from '../lib/collections';

if (Meteor.isServer) {

  (function () {
    // stream_server abstracts sockJS the DDP-Server talks to it. 
    var streamServer = Meteor.server.stream_server;
    // The connect event listener
    var standardConnect = streamServer.server._events.connection;
  
    // Overwrite the default event-handler
    streamServer.server._events.connection = function (socket) {
      // Overwrite the writes to the socket
      var write = socket.write;
      // console.log("arguments ");
      //console.log(arguments);
      socket.write = function () {
        let args = arguments;
        var self = this;
        var m = JSON.parse(arguments['0']);

        
        if (m.msg == "changed" && m.collection == "ActiveGameList" ) {
          if (m.fields) {
            const keys = Object.keys(m.fields);
            if (keys.length == 1 && keys[0] == "gameCommandHistory") {

              const room = ActiveGameList.findOne({_id: m.id});
              if (room.gameId == MIGRATION_CONST.poolGameId) {
                // console.log("old args");
                // console.log(arguments);
                m.fields.gameCommandHistory = m.fields.gameCommandHistory.splice(-10);
                args = [
                  JSON.stringify(m)
                ];
                // console.log("new args");
                // console.log(args);
              }
            }
          }
        }

        write.apply(self, args);
      };

      standardConnect.apply(this, arguments);
    }
  })()
}
