import { MutationResolvers, CreateAccountInput } from '../common/types/types';
import { authenticate, registerAccount } from './service/auth.service';

export const signUp: MutationResolvers['signup'] = async (
	_parent: unknown,
	{ input }: { input: CreateAccountInput }
) => {
	return await registerAccount(input);
};

export const signIn: MutationResolvers['login'] = async (
	_parent: unknown,
	{ email, password }: { email: string, password: string }
) => {
	return await authenticate(email, password);
};