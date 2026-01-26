import { Model, Schema, model } from 'mongoose';

import type { ISettings } from '../types/mongodb';
import { PermissionsModel } from './Permissions';

const SettingsSchema = new Schema<ISettings>({
    _id: String,
    permissions: [
        { type: Schema.Types.ObjectId, ref: PermissionsModel.name },
    ],
});

export const SettingsModel: Model<ISettings> = model(
    'Settings',
    SettingsSchema,
);
