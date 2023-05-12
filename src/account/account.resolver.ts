import { ErrorHandler } from '../common/helpers/errorHandler';
import {isEmpty} from 'lodash';
import {
	getAccountBalance,
	getAccountById,
} from './service/account.service';
import {
	QueryResolvers,
	Account,
} from '../common/types/types';
import { HttpStatus } from '../common/types';

export const findAccount: QueryResolvers['account'] = async (
	_parent: unknown,
	{ id }: { id: string },
	{account}: { account: Account | undefined }
) => {
	if (isEmpty(account)) {
		throw new ErrorHandler('Unauthorization access', HttpStatus.UNAUTHORIZED);
	}
	return await getAccountById(id);
};


export const getBalance: QueryResolvers['balance'] = async (
	_parent: unknown,
	_args: unknown,
	{account}: { account: Account | undefined }
) => {
	if (isEmpty(account)) {
		throw new ErrorHandler('Unauthorization access', HttpStatus.UNAUTHORIZED);
	}
	return await getAccountBalance(account.id);
};
