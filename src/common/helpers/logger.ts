import pino from 'pino';

export const logger = pino({
	level: /^dev/.test(process.env.NODE_ENV || '') ? 'debug' : 'info',
	formatters: {
		level(level) {
			return { level };
		},
	},
});
