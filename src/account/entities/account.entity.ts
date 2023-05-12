import { Schema, model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { IAccount } from '../types';

const accountSchema = new Schema({
	id: {
		type: String,
		default: uuid(),
	},
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	balance: {
		type: Number,
		default: 0,
	},
	password: {
		type: String,
		required: true,
	},
});

const Account = model<IAccount>('Account', accountSchema);
export default Account;