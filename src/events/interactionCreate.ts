import { type Interaction, MessageFlags } from 'discord.js';

import { Event } from '../classes/Event';
import type { ExtendedClient } from '../classes/Client';
import type { ISettings } from '../types/mongodb';
import { SettingsModel } from '../models/Settings';

export default class InteractionCreate extends Event<'interactionCreate'> {
    constructor(client: ExtendedClient) {
        super(client, 'interactionCreate');
    }

    override async execute(interaction: Interaction) {
        if (!interaction.guild) return;
        if (
            interaction.guild &&
            !this.client.settings.has((interaction.guild || {}).id)
        ) {
            const s: ISettings = await SettingsModel.findOneAndUpdate(
                { _id: interaction.guild.id },
                { toUpdate: true },
                {
                    upsert: true,
                    setDefaultsOnInsert: true,
                    new: true,
                },
            ).populate('permissions');

            this.client.logger.info(
                `Setting sync: Fetch Database -> Client (${interaction.guild.id})`,
            );

            this.client.settings.set(interaction.guild.id, s);
        } else {
            const settings = this.client.settings.get(
                interaction.guild ? interaction.guild.id : 'default',
            );
            if (!settings) return;
        }

        if (interaction.isCommand()) {
            const command = this.client.commands.get(
                interaction.commandName,
            );

            if (!command) return;

            try {
                await command.preCheck(interaction);
            } catch (error) {
                this.client.logger.error(`Error: ${error}`);
                await interaction.reply({
                    content: `There was an error executing ${interaction.commandName}`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
}
