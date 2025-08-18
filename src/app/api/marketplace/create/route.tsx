import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
	user: "clark",
	host: "199.244.49.83",
	database: "swingsocialdb",
	password: "Bmw740il#$",
	port: 5432,
});

export async function POST(req: Request) {
	try {
		const {
			title,
			category,
			description,
			link,
			price,
			images,
			OrganizerId,
			active,
		} = await req.json();
		console.log(
			title,
			category,
			description,
			link,
			price,
			images,
			OrganizerId,
			active
		);

		const query = `SELECT * FROM public.market_insert_product($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
		const values = [
			OrganizerId,
			title,
			description,
			category,
			link,
			images[0],
			images[1],
			images[2],
			images[3],
			images[4],
			active,
			price,
		];
		const result = await pool.query(query, values);

		console.log("success------------------------------------");

		return NextResponse.json({
			cities: result.rows.map((row, index) => ({
				id: index,
				City: row.City,
			})),
		});
	} catch (error) {
		console.error("Failed to get the history:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
