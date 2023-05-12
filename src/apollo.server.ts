import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateToken } from './account/service/auth.service';
import { logger } from './common/helpers/logger';
import resolvers from './resolvers';

type MyContext = Record<string, never>;

const GRAPHQL_SCHEMA_PATH = resolve(__dirname, 'schema.graphql');

const typeDefs = readFileSync(GRAPHQL_SCHEMA_PATH, { encoding: 'utf-8' });

//Setting of Apollo Graphql server
const server = new ApolloServer<MyContext>({
	typeDefs,
	resolvers,
	logger: logger,
});

export const startServer = async () => {
	logger.info('Starting Apollo standaloneServer .....');
	await startStandaloneServer(server, {
		context: async ({ req }) => {
			// Get the user token from the headers.
			const authorization = req.headers.authorization || '';

			if (!authorization) {
				return { account: {} };
			}

			const token = authorization.includes('bearer')
				? authorization.split(' ')[1]
				: '';

			// Try to retrieve a account with the token
			const account = await validateToken(token);
			// Add the user to the context
			return { account };
		},
		listen: { port: Number(process.env.PORT || 4000) },
	})
		.then((result) => logger.info(`🚀 Server ready at: ${result.url}`))
		.catch((error) => logger.error(error));
};
