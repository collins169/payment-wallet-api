export const HttpStatus = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
} as const;

export type StatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export type KafkaProducerMessage = {
	key?: string,
	value: string
}
