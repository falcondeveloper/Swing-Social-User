/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { responsiveFontSizes } from "@mui/material";
import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";

const pool = new Pool({
	user: "clark",
	host: "199.244.49.83",
	database: "swingsocialdb",
	password: "Bmw740il#$",
	port: 5432,
});

export async function GET(req: Request) {
	try {
		// Extract the search parameters
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("id"); // User ID to fetch a single record

		// Extract the IP address

		// Construct the query
		let query = `SELECT * FROM admin_upgrade_to_paid($1)`;
		const values = [userId];

		// Execute the query
		const membershipStatus = await pool.query(query, values);

		return NextResponse.json({
			membership: membershipStatus.rows,
		});
	} catch (error) {
		console.error("Database query failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Upgrade User Function
export async function POST(req: Request) {
	try {
		// Extract profileId from the request body
		const { profileId, price } = await req.json();

		if (!profileId) {
			return NextResponse.json(
				{ error: "Profile ID is required to upgrade the user." },
				{ status: 400 }
			);
		}

		console.log(`Upgrading user with Profile ID: ${profileId}`);

		// Call the database function to upgrade the user
		const upgradeQuery = `SELECT * FROM admin_upgrade_to_paid2($1, $2)`;
		const result = await pool.query(upgradeQuery, [profileId, price]);

		if (result?.rowCount === 0) {
			return NextResponse.json(
				{ error: `No user found with Profile ID ${profileId}` },
				{ status: 404 }
			);
		}

		console.log(`User with Profile ID ${profileId} upgraded successfully.`);
		return NextResponse.json(
			{ message: `User with Profile ID ${profileId} upgraded successfully.` },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to upgrade user:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
