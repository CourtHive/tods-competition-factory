import { callListener, getNotices, getTopics } from './globalState';

export async function notifySubscribers() {
  const { topics } = getTopics();
  const promises = [];

  for (const topic of topics) {
    const notices = getNotices({ topic });
    if (notices) promises.push(callListener({ topic, notices }));
  }

  //Lets run all subscribers
  await Promise.all(promises);
}
