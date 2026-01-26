import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
} from 'discord.js';

import { Command } from '../../classes/Command';
import type { ExtendedClient } from '../../classes/Client';

export default class PingCommand extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            type: ApplicationCommandType.ChatInput,
            name: 'ping',
            description: 'Replies with pong.',
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        return await interaction.reply('pong');
    }
}
