import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
	user: "clark",
	host: "199.244.49.83",
	database: "swingsocialdb",
	password: "Bmw635csi#",
	port: 5432,
});

export async function POST(req: Request) {
	try {
		const { productId, price, title, description, link, category, active } =
			await req.json();
		console.log(title, description, link, price, productId, active);

		const query = `SELECT * FROM public.market_edit_product($1, $2, $3, $4, $5, $6, $7)`;
		const values = [
			productId,
			title,
			description,
			category,
			link,
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
