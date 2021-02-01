import { callListener, getNotices, getTopics } from './globalState';

export function notifySubscribers() {
  const { topics } = getTopics();
  topics.forEach((topic) => {
    const notices = getNotices({ topic });
    if (notices) {
      callListener({ topic, notices });
    }
  });
}
