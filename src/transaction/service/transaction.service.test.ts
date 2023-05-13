const mockingoose = require("mockingoose");
import Account from "../../account/entities/account.entity";
import { ErrorHandler } from "../../common/helpers/errorHandler";
import { HttpStatus } from "../../common/types";
import Transaction, { TransactionStatus } from "../entities/transaction.entity";
import * as transactionService from "./transaction.service";

jest.mock("../../account/entities/account.entity");
jest.mock("../entities/transaction.entity");

describe("transaction service", () => {
	const id = "507f191e810c19729de860ea";
	const accountData = {
		id,
		_id: "object-id",
		name: "Test User",
		email: "testuser@example.com",
		balance: 800,
	};

	const mockTransaction = {
		id,
		sender: accountData,
		recipient: accountData,
		amount: 300,
		status: TransactionStatus.Success,
		reason: "SUCCESS",
		timestamp: new Date(),
	};

	beforeEach(() => {
		jest.spyOn(Account, "findOne").mockResolvedValue(accountData);

		Transaction.find = jest
			.fn()
			.mockImplementationOnce(() => ({
				sort: jest.fn().mockResolvedValueOnce([mockTransaction]),
			}))
			.mockResolvedValue([mockTransaction]);
	});

	afterEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe("getTransactionHistory", () => {
		it("should return the transaction history for a given account", async () => {
			const result = await transactionService.getTransactionHistory(id);

			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
			expect(result).toMatchObject([mockTransaction]);
			expect(Transaction.find).toHaveBeenCalledWith({
				$or: [
					{
						sender: "object-id",
					},
					{
						recipient: "object-id",
					},
				],
			});
		});

		it("should throw an error if the account is not found", async () => {
			Account.findOne = jest.fn().mockResolvedValue(null);

			await expect(transactionService.getTransactionHistory(id)).rejects.toThrow(
				new ErrorHandler("Account not found", HttpStatus.NOT_FOUND)
			);
			expect(Account.findOne).toHaveBeenCalledWith({
				id,
			});
		});
	});

	
});
