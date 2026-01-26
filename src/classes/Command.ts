import {
    type APIEmbed,
    type ApplicationCommandOptionData,
    ApplicationCommandType,
    ApplicationIntegrationType,
    type CommandInteraction,
    GuildMember,
    InteractionContextType,
    MessageFlags,
} from 'discord.js';

import type { ExtendedClient } from './Client';

export type CustomApplicationCommandOptionData =
    ApplicationCommandOptionData & { minimumPermissionLevel: number };

type CommandData = {
    type: ApplicationCommandType;
    contexts?: InteractionContextType[];
    integration?: ApplicationIntegrationType[];
    name: string;
    description?: string;
    options?: CustomApplicationCommandOptionData[];
    permissionLevel?: number;
};

export type CommandBody = {
    type: ApplicationCommandType;
    contexts?: InteractionContextType[];
    integration_types?: ApplicationIntegrationType[];
    name: string;
    description: string;
};

export abstract class Command {
    /**
     * An object of data for commands.
     */
    public readonly data: {
        type: ApplicationCommandType;
        contexts: InteractionContextType[];
        integration: ApplicationIntegrationType[];
        name: string;
        description: string;
        options: CustomApplicationCommandOptionData[];
        permissionLevel: number;
    };

    /**
     * An instance of our extended client
     */
    client: ExtendedClient;

    constructor(client: ExtendedClient, data: CommandData) {
        const permissionLevel = data.permissionLevel ?? 0;
        const options = data.options ?? [];

        options.forEach((option) => {
            if ('minimumPermissionLevel' in option) {
                this.validatePermissionLevel(
                    option.minimumPermissionLevel,
                );
            }
        });
        this.client = client;
        this.data = {
            ...data,
            contexts: data.contexts ?? [InteractionContextType.Guild],
            integration: data.integration ?? [
                ApplicationIntegrationType.GuildInstall,
            ],
            options,
            permissionLevel,
            description: data.description ?? '',
        };
    }

    /**
     * Validates the permission level attached falls within the expected range.
     * @remarks Given this is a template, you could shrink/expand this, but personally, i like this (existing) configuration.
     */
    private validatePermissionLevel(level: number): void {
        if (level < 0 || level > 16) {
            throw new Error(
                `Permission level must be between 0-16. Got: ${level}`,
            );
        }
    }

    /**
     * Method to validate user has permission to run the command.
     * @param interaction The interaction ran
     * @returns An `APIEmbed` letting the user know of their missing permissions, or `null`.
     */
    private async validate(interaction: CommandInteraction) {
        /** We cant even check the interaction member.. 
      Permissions dont matter if the user has no guild to worry about.
     */
        if (
            !this.data.integration.includes(
                ApplicationIntegrationType.GuildInstall,
            )
        ) {
            return null;
        }
        const subcommand = interaction.isChatInputCommand()
            ? interaction.options.getSubcommand(false)
            : null;

        const requiredLevel = subcommand
            ? this.data.options.find(
                  (command) => command.name === subcommand,
              )?.minimumPermissionLevel
            : this.data.permissionLevel;

        const embed: APIEmbed = {
            title: 'Missing Permissions',
        };

        const permLevel = this.client.permissions.getPermissionLevel(
            undefined,
            interaction.member as GuildMember,
        );

        if (requiredLevel && requiredLevel > permLevel) {
            embed.description = `Incorrect permission. (${requiredLevel} vs ${permLevel})`;
            return embed;
        }

        return null;
    }
    /**
     * A method to actually call the validation, prechecking before executing the method.
     * @param interaction The interaction
     * @returns `InteractionResponse` if the user failed validation, or `unknown` to allow for varying responses from `execute`
     */
    public async preCheck(interaction: CommandInteraction) {
        const validationError = await this.validate(interaction);

        if (validationError) {
            return interaction.reply({
                embeds: [validationError],
                flags: MessageFlags.Ephemeral,
            });
        }

        return this.execute(interaction);
    }

    /**
     * An abstract method to be implemented by extending commands to run them.
     * @param interaction The interaction passed.
     */
    protected abstract execute(
        interaction: CommandInteraction,
    ): unknown;
}
