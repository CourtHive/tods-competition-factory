import { callListener, getNotices, getTopics } from './globalState';

export function notifySubscribers() {
  const { topics } = getTopics();
  topics.forEach((topic) => {
    const payload = getNotices({ topic });
    callListener({ topic, payload });
  });
}
