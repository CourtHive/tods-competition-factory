import { callListener, getNotices, getTopics } from './globalState';

export async function notifySubscribers() {
  const { topics } = getTopics();
  for (const topic of topics) {
    const notices = getNotices({ topic });
    if (notices) {
      await callListener({ topic, notices });
    }
  }
}
