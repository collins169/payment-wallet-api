import Account from "../../account/entities/account.entity";
import { connection } from "../database";

// Define some account data to seed the database
const accountData = [
	{
		name: "Alice Manny",
		email: "alice@test.com",
		password: "$2b$10$MnBNXtOkIoqfh6rtlH87pulfkipzyY4O6XF0EXlh6GZgIgneWGAnm",
		balance: 3000,
	},
	{
		name: "Bob Joe",
		email: "bob@test.com",
		password: "$2b$10$MnBNXtOkIoqfh6rtlH87pulfkipzyY4O6XF0EXlh6GZgIgneWGAnm",
		balance: 100,
	},
];

// Seed the database with the user data
async function seedDatabase() {
	try {
		connection.then(async () => {
			console.log("connection to database successfully established");
			// Check if any account exist
			const accounts = await Account.find({});
			
			if (accounts.length <= 0) {
				// Insert the account data into the database
				console.log("Database seeding!");
				await Account.insertMany(accountData);
			}
			console.log("Database seeded successfully!");
			process.exit(0);
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

seedDatabase();
