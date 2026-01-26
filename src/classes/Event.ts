import type { ClientEvents } from 'discord.js';
import type { ExtendedClient } from './Client';

export abstract class Event<
    Key extends keyof ClientEvents = keyof ClientEvents,
> {
    /**
     * The name of the event.
     */
    name: Key;
    /**
     * An instance of our client
     */
    client: ExtendedClient;

    constructor(client: ExtendedClient, name: Key) {
        this.client = client;
        this.name = name;
    }

    /**
     * The method used to handle the gateway event.
     * @param client - Our client
     * @param args - The appropriate args based on the {@link ClientEvents}
     */
    abstract execute(...args: ClientEvents[Key]): unknown;
}
