import type { Document } from 'mongoose';

export interface RawSettings {
    toUpdate: boolean;
    createdAt: number;
    updatedAt: number;
    permissions: IPermissions[];
}

export interface ISettings extends RawSettings, Document {}

export interface RawPermissions {
    guildId: string;
    level: number;
    roleId: string;
}

export interface IPermissions extends RawPermissions, Document {}
