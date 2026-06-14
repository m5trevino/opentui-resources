export class Logger {
  log(message: string) {
    console.log(`[INFO] ${message}`);
  }
  error(message: string) {
    console.error(`[ERROR] ${message}`);
  }
}

export const logger = new Logger();
