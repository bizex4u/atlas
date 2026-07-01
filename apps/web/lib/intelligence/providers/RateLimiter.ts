type Task<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

export class RateLimiter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly queue: Task<any>[] = [];
  private lastCallTime = 0;
  private processing = false;

  constructor(private readonly minIntervalMs: number) {}

  schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.processing) void this.process();
    });
  }

  private async process(): Promise<void> {
    this.processing = true;
    while (this.queue.length > 0) {
      const wait = this.minIntervalMs - (Date.now() - this.lastCallTime);
      if (wait > 0) await sleep(wait);
      this.lastCallTime = Date.now();
      const task = this.queue.shift()!;
      // Fire-and-forget: result goes to the promise, we move on
      task.fn().then(task.resolve).catch(task.reject);
    }
    this.processing = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
