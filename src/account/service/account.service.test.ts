const mockingoose = require('mockingoose');
import Account from '../entities/account.entity';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import * as accountService from './account.service';
import { ErrorHandler } from '../../common/helpers/errorHandler';
import { HttpStatus } from '../../common/types';

jest.mock('bcrypt');
jest.mock('../entities/account.entity');

describe('account service', () => {
	const password = 'testpassword';
	const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

	const id = '507f191e810c19729de860ea';
	const accountData = {
		_id: id,
		id: uuid(),
		name: 'Test User',
		email: 'testuser@example.com',
		password: hashedPassword,
		balance: 30,
	};
	const mockError = new ErrorHandler('Account not found', HttpStatus.NOT_FOUND);

	beforeEach(() => {
		jest.spyOn(Account, 'findOne').mockResolvedValue(accountData);
	});

	afterAll(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe('getAccountById', () => {
		it('should return the account', async () => {
			const result = await accountService.getAccountById(id);
			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
			expect(result).toEqual({
				id: accountData.id,
				email: accountData.email,
				name: accountData.name,
			});
		});

		it('should throw error when account not found', async () => {
			jest.spyOn(Account, 'findOne').mockResolvedValue(null);

			await expect(accountService.getAccountById(id)).rejects.toThrow(
				mockError
			);
			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
		});
	});

	describe('getAccountBalance', () => {
		it('should return the balance', async () => {
			const result = await accountService.getAccountBalance(id);

			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
			expect(result).toEqual(accountData.balance);
		});

		it('should throw error when account not found', async () => {
			jest.spyOn(Account, 'findOne').mockResolvedValue(null);

			await expect(accountService.getAccountBalance(id)).rejects.toThrow(
				mockError
			);
			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
		});
	});
});
