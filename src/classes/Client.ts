import { Client, type ClientOptions, Collection } from 'discord.js';
import { type ClientConfig, clientConfig } from '../types/clientConfig';
import { dirname, join } from 'path';

import type { Command } from './Command';
import type { Event } from './Event';
import type { ISettings } from '../types/mongodb';
import { Logger } from './Logger';
import { PermissionManager } from './PermissionManager';
import { SettingsModel } from '../models/Settings';
import { fileURLToPath } from 'bun';
import mongoose from 'mongoose';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ExtendedClient extends Client {
    /**
     * A readonly instance of our configuration file.
     *
     * @see {@link clientConfig}
     */
    public readonly config: ClientConfig;

    /**
     * A map of our events.
     */
    public events: Map<string, Event>;

    /**
     * A collection of all commands
     */
    public commands: Collection<string, Command>;

    /**
     * A global cache collection of server settings.
     */
    public settings: Collection<string, ISettings>;

    /**
     * A logger for errors, warnings, or general information.
     */
    public logger: Logger;

    /**
     * A permissions handler.
     */
    public permissions: PermissionManager;

    constructor(options: ClientOptions) {
        super(options);

        this.config = clientConfig;
        this.events = new Map();
        this.commands = new Collection();
        this.settings = new Collection();
        this.logger = new Logger();

        this.permissions = new PermissionManager(this);
    }

    /**
     * Loads the database and the command and event files.
     */
    public async initalize() {
        await this.loadMongo();
        await this.loadCommands();
        await this.loadEvents();
    }

    /**
     * Load our mongo db instance, using the MONGODB_URL in process.env.
     */
    private async loadMongo() {
        await mongoose
            .connect(process.env.MONGODB_URL as string)
            .catch((e) => {
                this.logger.error(e);
                process.exit(1);
            });

        this.settings.set(
            'default',
            await SettingsModel.findOneAndUpdate(
                { _id: 'default' },
                { toUpdate: true },
                { upsert: true, setDefaultsOnInsert: true, new: true },
            ),
        );
    }

    /**
     * A recursive method to load all commands
     * @param directory - The directory our files are stored in
     */
    private async loadCommands(directory?: string): Promise<void> {
        const commandsPath =
            directory ?? join(__dirname, '../commands');
        try {
            const items = readdirSync(commandsPath, {
                withFileTypes: true,
            });

            for (const item of items) {
                const fullPath = join(commandsPath, item.name);
                if (item.isDirectory()) {
                    await this.loadCommands(fullPath);
                    continue;
                }

                if (
                    !item.name.endsWith('.ts') &&
                    !item.name.endsWith('.js')
                )
                    continue;
                try {
                    const commandModule = await import(fullPath);
                    const CommandClass = commandModule.default;
                    if (!CommandClass) {
                        this.logger.warn(
                            `No default export in command file: ${fullPath}`,
                        );
                        continue;
                    }

                    const command: Command = new CommandClass(this);
                    this.commands.set(command.data.name, command);
                    this.logger.info(
                        `Loaded command: ${command.data.name}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Failed to load command ${fullPath}:`,
                        error,
                    );
                }
            }

            if (!directory) {
                this.logger.info(
                    `Loaded ${this.commands.size} commands`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to read directory ${commandsPath}:`,
                error,
            );
        }
    }

    /**
     * A method to load all event files.
     */
    private async loadEvents(): Promise<void> {
        const eventsPath = join(__dirname, '../events');

        try {
            const eventFiles = readdirSync(eventsPath);

            for (const file of eventFiles) {
                if (!file.endsWith('.ts') && !file.endsWith('.js'))
                    continue;

                try {
                    const eventModule = await import(
                        join(eventsPath, file)
                    );
                    const EventClass = eventModule.default;

                    if (!EventClass) {
                        this.logger.warn(
                            `No default export in event file: ${file}`,
                        );
                        continue;
                    }

                    const event: Event = new EventClass(this);

                    this.events.set(event.name, event);

                    this.on(event.name, (...args) =>
                        event.execute(...args),
                    );

                    this.logger.info(`Loaded event: ${event.name}`);
                } catch (error) {
                    this.logger.error(
                        `Failed to load event ${file}:`,
                        error,
                    );
                }
            }

            this.logger.info(`Loaded ${this.events.size} events`);
        } catch (error) {
            this.logger.error(
                'Failed to read events directory:',
                error,
            );
        }
    }
}
