import { isEmpty } from 'lodash';
import Account from '../../account/entities/account.entity';
import Transaction, { TransactionStatus } from '../entities/transaction.entity';
import { ErrorHandler } from '../../common/helpers/errorHandler';
import { startSession } from 'mongoose';
import { logger } from '../../common/helpers/logger';
import { HttpStatus } from '../../common/types';
import { sendMessageToTopic } from "../../common/service/kafka.service";
import { IAccount } from '../../account/types';

export const getTransactionHistory = async (id: string) => {
	const account = await Account.findOne({
		id,
	});
	
	if (isEmpty(account)) {
		throw new ErrorHandler("Account not found", HttpStatus.NOT_FOUND);
	}

	const transactions = await Transaction.find({
		$or: [
			{
				sender: account?._id,
			},
			{
				recipient: account?._id,
			},
		],
	}).sort({ timestamp: -1 });
	return transactions;
};

const  validateTransaction = async ({
	senderEmail,
	recipientEmail,
	amount,
}: {
	senderEmail: string;
	recipientEmail: string;
	amount: number;
}) => {
	if (senderEmail === recipientEmail) {
		throw new ErrorHandler('You cant send money to yourself', HttpStatus.BAD_REQUEST);
	}

	const [sender, recipient] = await Promise.all([
		Account.findOne({
			email: senderEmail,
		}),
		Account.findOne({
			email: recipientEmail,
		}),
	]);

	if (isEmpty(sender)) {
		throw new ErrorHandler('Sender account not found', 404);
	}

	if (isEmpty(recipient)) {
		throw new ErrorHandler('Recipient account not found', 404);
	}

	//Let create the transaction in pending state
	const transaction = new Transaction({
		recipient,
		sender,
		amount,
	});

	const { id } = await transaction.save();
	return {
		id,
		sender,
		recipient,
	};
};

const processTransaction = async ({
	transactionId,
	senderEmail,
	recipientEmail,
	amount,
}: {
	transactionId: string;
	senderEmail: string;
	recipientEmail: string;
	amount: number;
}) => {
	//Intializing session
	const session = await startSession();
	try {
		await Account.findOneAndUpdate(
			{
				email: senderEmail,
			},
			{ $inc: { balance: -amount } },
			{ session }
		);

		await Account.findOneAndUpdate(
			{
				email: recipientEmail,
			},
			{ $inc: { balance: amount } },
			{ session }
		);

		const transaction = await Transaction.findOneAndUpdate(
			{ id: transactionId },
			{
				$inc: {
					status: TransactionStatus.Success,
					reason: 'Transfer Successfully',
				},
			},
			{ session }
		);

		//Commit Transaction
		await session.commitTransaction();

		return transaction;
	} catch (error) {
		logger.error(error);
		//An error occurred let rollback the changes
		await session.abortTransaction();
		throw new ErrorHandler('Transaction could not be processed');
	} finally {
		session.endSession();
	}
};

export const transferFunds = async ({
	senderEmail,
	recipientEmail,
	amount,
}: {
	senderEmail: string;
	recipientEmail: string;
	amount: number;
}) => {
	const { id, sender } = await validateTransaction({
		senderEmail,
		recipientEmail,
		amount,
	});

	if (sender.balance < amount) {
		await Transaction.findOneAndUpdate(
			{ id },
			{
				$inc: {
					status: TransactionStatus.Failed,
					reason: 'Insufficient balance',
				},
			}
		);
		throw new ErrorHandler('Insufficient balance', HttpStatus.BAD_REQUEST);
	}

	const processedTransction = await processTransaction({
		senderEmail,
		recipientEmail,
		amount,
		transactionId: id,
	});

	const transResponse = {
		id,
		sender: processedTransction?.sender as IAccount,
		recipient: processedTransction?.recipient as IAccount,
		amount,
		status: processedTransction?.status as TransactionStatus,
		reason: processedTransction?.reason || '',
		timestamp: processedTransction?.timestamp || '',
	};

	// Publishing transaction to transactions topic
	await sendMessageToTopic("transactions", transResponse);

	return transResponse;
};
