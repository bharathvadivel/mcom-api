export function logger(message: string) {
  // Simple logger, can be replaced with Winston or Pino
  console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
}
