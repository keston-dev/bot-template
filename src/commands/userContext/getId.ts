import {
    ApplicationCommandType,
    UserContextMenuCommandInteraction,
} from 'discord.js';

import { Command } from '../../classes/Command';
import type { ExtendedClient } from '../../classes/Client';

export default class GetId extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            type: ApplicationCommandType.User,
            name: 'Get ID',
        });
    }

    async execute(interaction: UserContextMenuCommandInteraction) {
        const user = interaction.targetUser;

        return interaction.reply({
            content: `The id of the target user is ${user.id}`,
            flags: 'Ephemeral',
        });
    }
}
