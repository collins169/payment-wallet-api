import { isEmpty } from 'lodash';
import { ErrorHandler } from '../common/helpers/errorHandler';
import { QueryResolvers, Account, MutationResolvers } from '../common/types/types';
import {
	getTransactionHistory,
	transferFunds,
} from './service/transaction.service';
import { HttpStatus } from '../common/types';

export const getTransactions: QueryResolvers['transactions'] = async (
	_parent: unknown,
	_args: unknown,
	{ account }: { account: Account | undefined }
) => {
	if (isEmpty(account)) {
		throw new ErrorHandler('Unauthorization access', HttpStatus.UNAUTHORIZED);
	}
	return await getTransactionHistory(account.id);
};

export const sendFund: MutationResolvers['transfer'] = async (
	_parent: unknown,
	{ email, amount }: { email: string; amount: number },
	{ account }: { account: Account | undefined }
) => {
	if (isEmpty(account)) {
		throw new ErrorHandler('Unauthorization access', HttpStatus.UNAUTHORIZED);
	}
	const transferResponse = await transferFunds({
		senderEmail: account.email,
		recipientEmail: email,
		amount,
	});
	return transferResponse;
};
