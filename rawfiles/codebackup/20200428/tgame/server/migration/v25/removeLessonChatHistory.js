import { LessonChatHistory } from "../../../lib/collections";

/**
 * Remove all old messages format.
 */
function removeLessonChatHistory() {
  LessonChatHistory.remove({});
}

export default removeLessonChatHistory;
