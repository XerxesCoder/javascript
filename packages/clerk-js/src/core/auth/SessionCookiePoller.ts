import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { SafeLock } from './safeLock';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';
const INTERVAL_IN_MS = 5 * 1000;

export class SessionCookiePoller {
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private workerTimers = createWorkerTimers();
  private timerId: ReturnType<typeof this.workerTimers.setInterval> | null = null;

  public startPollingForSessionToken(cb: () => Promise<unknown>): void {
    if (this.timerId) {
      return;
    }

    const run = async () => {
      console.log('poller ticks');
      await this.lock.acquireLockAndRun(cb);
      this.timerId = this.workerTimers.setTimeout(run, INTERVAL_IN_MS);
    };

    void run();
  }

  public stopPollingForSessionToken(): void {
    if (this.timerId) {
      this.workerTimers.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
