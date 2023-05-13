import Account from '../entities/account.entity';
import { logger } from '../../common/helpers/logger';
import { ErrorHandler } from '../../common/helpers/errorHandler';
import { isEmpty } from 'lodash';
import { HttpStatus } from '../../common/types';

export const getAccountById = async (id: string) => {
	logger.info(`getting account by id ${id}`);
	const account = await Account.findOne({
		id,
	});

	if (isEmpty(account)) {
		throw new ErrorHandler('Account not found', HttpStatus.NOT_FOUND);
	}

	return {
		id: account.id,
		name: account.name,
		email: account.email,
	};
};

export const getAccountBalance = async (id: string) => {
	logger.info('getting account balance');
	const account = await Account.findOne({
		id,
	});

	if (isEmpty(account)) {
		throw new ErrorHandler('Account not found', HttpStatus.NOT_FOUND);
	}
	return account.balance;
};
