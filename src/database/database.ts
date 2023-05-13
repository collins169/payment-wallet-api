import "dotenv/config";
import { connect } from "mongoose";

const { DATABASE_URL, DATABASE_NAME, DATABASE_PASS, DATABASE_USER } =
	process.env;

const connection = connect(String(DATABASE_URL), {
	dbName: String(DATABASE_NAME),
	user: String(DATABASE_USER),
	pass: String(DATABASE_PASS),
	autoIndex: true,
	maxPoolSize: 10,
});

export { connection };
