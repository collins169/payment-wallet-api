import { Resolvers } from './common/types/types';
import { findAccount, getBalance } from './account/account.resolver';
import { signIn, signUp } from './account/auth.resolver';
import { getTransactions, sendFund } from './transaction/transaction.resolver';

// Define the resolvers
const resolvers: Resolvers = {
	Mutation: {
		signup: signUp,
		login: signIn,
		transfer: sendFund
	},
	Query: {
		account: findAccount,
		balance: getBalance,
		transactions: getTransactions,
	},
};

export default resolvers;
