import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import { StatusCode, HttpStatus } from '../types';

export class ErrorHandler extends GraphQLError {
	constructor(message: string, statusCode?: StatusCode) {
		const options: GraphQLErrorOptions = {
			extensions: {
				code: HttpStatus[statusCode as unknown as keyof typeof HttpStatus],
				http: {
					status: statusCode,
				},
			},
		};
		super(message, options);
	}
}
