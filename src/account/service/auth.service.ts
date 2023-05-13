import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { isEmpty } from "lodash";
import { ErrorHandler } from "../../common/helpers/errorHandler";
import { HttpStatus } from "../../common/types";
import { AuthResponse, CreateAccountInput } from "../../common/types/types";
import Account from "../entities/account.entity";
import { getAccountById } from "./account.service";
import { logger } from "../../common/helpers/logger";

export const registerAccount = async (input: CreateAccountInput) => {
	const existingAccount = await Account.findOne({
		email: input.email,
	});
	if (!isEmpty(existingAccount)) {
		throw new ErrorHandler(
			"Account with email already exist",
			HttpStatus.CONFLICT
		);
	}
	const salt = genSaltSync(10);
	const hashPassword = hashSync(input.password, salt);
	const acct = new Account({ ...input, password: hashPassword });
	const account = await acct.save();

	return {
		id: account.id,
		name: account.name,
		email: account.email,
	};
};

export const authenticate = async (
	email: string,
	password: string
): Promise<AuthResponse> => {
	const account = await Account.findOne({
		email,
	});

	const errorMessage = "Invalid username/password";
	if (isEmpty(account)) {
		throw new ErrorHandler(errorMessage, HttpStatus.UNAUTHORIZED);
	}

	//Validate user password
	const match = compareSync(password, account.password);

	if (!match) {
		throw new ErrorHandler(errorMessage, HttpStatus.UNAUTHORIZED);
	}

	//Generate jwt token
	const token = sign(
		{ id: account.id },
		process.env.JWT_SECRET || "payment-wallet-api",
		{
			algorithm: "HS256",
			expiresIn: "1d",
			subject: account.id,
		}
	);

	return {
		token,
		account: {
			id: account.id,
			name: account.name,
			email: account.email,
		},
	};
};

export const validateToken = async (token: string) => {
	try {
		if (isEmpty(token)) {
			return {};
		}
		const { sub: accountId } = verify(
			token,
			process.env.JWT_SECRET || "payment-wallet-api"
		) as JwtPayload;

		if (isEmpty(accountId)) {
			return {};
		}
		const account = await getAccountById(String(accountId));

		return account;
	} catch (err) {
		logger.error(err);
	}
};
