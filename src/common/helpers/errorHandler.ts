import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import { StatusCode, HttpStatus } from '../types';

const getKeyByValue = (object: { [key: string]: number }, value: number) => {
	return Object.keys(object).find((key) => object[key] === value);
};

export class ErrorHandler extends GraphQLError {
	constructor(message: string, statusCode: StatusCode = 500) {
		const options: GraphQLErrorOptions = {
			extensions: {
				code: getKeyByValue(HttpStatus, statusCode),
				http: {
					status: statusCode,
				},
			},
		};
		super(message, options);
	}
}
