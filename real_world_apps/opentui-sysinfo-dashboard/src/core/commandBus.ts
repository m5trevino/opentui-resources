type CommandHandler = () => void;

/**
 * CommandBus decouples keyboard input from actual logic.
 * Open/Closed: new commands can be registered dynamically.
 */
class CommandBus {
  private handlers = new Map<string, CommandHandler>();

  register(key: string, handler: CommandHandler) {
    this.handlers.set(key, handler);
  }

  execute(key: string) {
    const handler = this.handlers.get(key);
    if (handler) handler();
  }
}

export const commandBus = new CommandBus();
