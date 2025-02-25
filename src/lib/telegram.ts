import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function sendTelegramMessage(message: string): Promise<void> {
  try {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    const telegramPath = process.env.TELEGRAM_SCRIPT_PATH;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!channelId || !telegramPath || !botToken) {
      console.log("Telegram configuration incomplete, skipping notification");
      return;
    }

    // Format the command with bot token
    const command = `${telegramPath} -t ${botToken} -c ${channelId} -H -D "${message}"`;
    await execAsync(command);
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}
