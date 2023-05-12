import mongoose from 'mongoose';

export interface IAccount extends mongoose.Document {
	id: string;
	name: string;
	email: string;
	balance: number;
	password: string;
}
