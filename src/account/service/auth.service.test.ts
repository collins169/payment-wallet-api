const mockingoose = require("mockingoose");
import { authenticate, registerAccount, validateToken } from "./auth.service";
import Account from "../entities/account.entity";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { ErrorHandler } from "../../common/helpers/errorHandler";
import { HttpStatus } from "../../common/types";
import jwt from "jsonwebtoken";
import * as accountService from "./account.service";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../entities/account.entity");
jest.mock("./account.service");

describe("auth service", () => {
	const mockUuid = uuid();

	// Mock jwt.verify function
	const verify = jwt.verify as unknown as jest.MockedFunction<
		(
			token: string,
			secretOrPublicKey: jwt.Secret,
			options?: jwt.VerifyOptions
		) => Record<string, unknown> | string
	>;

	const sign = jwt.sign as unknown as jest.MockedFunction<
		(
			payload: string,
			secretOrPublicKey: jwt.Secret,
			options?: jwt.SignOptions
		) => Record<string, unknown> | string
	>;

	beforeEach(() => {
		process.env.JWT_SECRET = "payment-wallet-api-test";
	});

	afterAll(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});
	describe("registerAccount", () => {
		it("should register a new account", async () => {
			const mockInput = {
				name: "John Doe",
				email: "john.doe@example.com",
				password: "password",
			};

			const expectedOutput = {
				id: mockUuid,
				name: "John Doe",
				email: "john.doe@example.com",
			};

			// Mock the Account model
			jest.spyOn(Account.prototype, "save").mockResolvedValue(expectedOutput);

			const result = await registerAccount(mockInput);

			expect(result).toEqual(expectedOutput);
			expect(Account.findOne).toHaveBeenCalledWith({ email: mockInput.email });
			expect(bcrypt.hashSync).toHaveBeenCalledWith(
				mockInput.password,
				bcrypt.genSaltSync(10)
			);
		});

		it("should throw an error when account with email already exists", async () => {
			const mockInput = {
				name: "John Doe",
				email: "john.doe@example.com",
				password: "password",
			};

			// Mock the Account model to return an account with the same email
			jest.spyOn(Account, "findOne").mockResolvedValue(mockInput);

			await expect(registerAccount(mockInput)).rejects.toThrow(
				"Account with email already exist"
			);

			expect(Account.findOne).toHaveBeenCalledWith({ email: mockInput.email });
		});
	});

	describe("authenticate", () => {
		it("should authenticate a user and generate a token", async () => {
			const token = "token-test-created";
			const email = "testuser@example.com";
			const password = "testpassword";
			const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
			const accountId = "507f191e810c19729de860ea";
			const accountData = {
				_id: accountId,
				id: mockUuid,
				name: "Test User",
				email,
				password: hashedPassword,
			};

			jest.spyOn(bcrypt, "compareSync").mockReturnValue(true);
			jest.spyOn(Account, "findOne").mockResolvedValue(accountData);
			sign.mockReturnValue(token);

			const result = await authenticate(email, password);

			expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);

			expect(Account.findOne).toHaveBeenCalledWith({ email });
			expect(result.token).toEqual(token);
			expect(result.account.id).toEqual(mockUuid);
			expect(result.account.email).toEqual(email);
		});

		it("should throw an error if user is not found", async () => {
			const email = "testuser@example.com";
			const password = "testpassword";

			jest.spyOn(Account, "findOne").mockResolvedValue(null);

			await expect(authenticate(email, password)).rejects.toThrowError(
				new ErrorHandler("Invalid username/password", HttpStatus.UNAUTHORIZED)
			);

			expect(Account.findOne).toHaveBeenCalledWith({ email });
		});
	});

	describe("validateToken", () => {
		it("should return empty object when token is empty", async () => {
			const result = await validateToken("");

			expect(result).toEqual({});
			expect(Account.findOne).not.toHaveBeenCalled();
		});

		it("should return empty object when token is invalid", async () => {
			const token = "invalid-token";

			verify.mockReturnValue({});
			const result = await validateToken(token);
			expect(result).toEqual({});
			expect(jwt.verify).toHaveBeenCalledWith(token, "payment-wallet-api-test");
		});

		it("should return account when token is valid", async () => {
			const accountId = "abc123";
			const token = "valid-token";
			const account = {
				id: accountId,
				name: "John Doe",
				email: "john.doe@example.com",
			};

			// Mock jwt.verify function to return account id
			verify.mockReturnValue({ sub: accountId });

			// Mock getAccountById function to return account
			jest.spyOn(Account, "findOne").mockResolvedValue(account);
			jest.spyOn(accountService, "getAccountById").mockResolvedValue(account);

			const result = await validateToken(token);

			expect(jwt.verify).toHaveBeenCalledWith(token, "payment-wallet-api-test");
			expect(result).toEqual(account);
		});
	});
});
