import { callListener, getNotices, getTopics } from './globalState';

export function notifySubscribers() {
  const { topics } = getTopics();

  for (const topic of topics) {
    const notices = getNotices({ topic });
    if (notices) callListener({ topic, notices });
  }
}

export async function notifySubscribersAsync() {
  const { topics } = getTopics();

  for (const topic of topics) {
    const notices = getNotices({ topic });
    if (notices) await callListener({ topic, notices });
  }
}
