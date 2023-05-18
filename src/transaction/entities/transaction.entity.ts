import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { IAccount } from '../../account/types';

export enum TransactionStatus {
	Failed = 'FAILED',
	Pending = 'PENDING',
	Success = 'SUCCESS',
}

export interface ITransaction extends mongoose.Document {
	id: string;
	sender: IAccount;
	recipient: IAccount;
	amount: number;
	status: TransactionStatus;
	reason: string;
	timestamp: Date;
}

const transactionSchema = new Schema({
	id: {
		type: String,
		default: uuid(),
	},
	sender: {
		type: Schema.Types.ObjectId,
		ref: 'Account',
	},
	recipient: {
		type: Schema.Types.ObjectId,
		ref: 'Account',
	},
	amount: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(TransactionStatus),
		default: TransactionStatus.Pending,
	},
	reason: {
		type: String,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const Transaction = model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
