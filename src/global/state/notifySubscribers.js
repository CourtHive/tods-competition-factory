import { callListener, getNotices, getTopics } from './globalState';

export function notifySubscribers() {
  const { topics } = getTopics();

  for (const topic of topics.sort()) {
    const notices = getNotices({ topic });
    if (notices) callListener({ topic, notices });
  }
}

export async function notifySubscribersAsync() {
  const { topics } = getTopics();

  for (const topic of topics.sort()) {
    // only tested with packaged version of factory
    // won't show up in test coverage
    const notices = getNotices({ topic });
    if (notices) await callListener({ topic, notices });
  }
}
