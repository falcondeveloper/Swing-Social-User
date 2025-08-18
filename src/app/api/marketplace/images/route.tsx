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
		const { images, productId } = await req.json();
		console.log(images, productId);

		const query = `SELECT * FROM public.market_edit_images($1, $2, $3, $4, $5, $6)`;
		const values = [
			productId,
			images[0],
			images[1],
			images[2],
			images[3],
			images[4],
		];
		const result = await pool.query(query, values);

		console.log("success------------------------------------");

		return NextResponse.json({
			message: "success",
		});
	} catch (error) {
		console.error("Failed to get the history:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
