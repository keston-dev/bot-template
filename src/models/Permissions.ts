import type { IPermissions, ISettings } from '../types/mongodb';
import { Model, Schema, model } from 'mongoose';

const PermissionsSchema = new Schema<IPermissions>({
    _id: String,
    guildId: { type: String, ref: 'Settings' },
    level: Number,
    roleId: String,
});

export const PermissionsModel: Model<IPermissions> = model(
    'Permissions',
    PermissionsSchema,
);
