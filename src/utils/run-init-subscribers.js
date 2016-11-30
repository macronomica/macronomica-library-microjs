import runSubscribers from './run-subscribers';

/**
 * @param {app} app
 * @returns {Promise<undefined>}
 */
export default function runInitSubscribers(app) {
  return runSubscribers(app, app.subscribers.run, subscriber => subscriber(app, { onClose }));

  function onClose(cb) {
    app.subscribers.end.push(cb);
  }
}