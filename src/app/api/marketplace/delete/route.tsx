import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

// PostgreSQL pool connection setup
const pool = new Pool({
	user: "clark",
	host: "199.244.49.83",
	database: "swingsocialdb",
	password: "Bmw635csi#",
	port: 5432,
});

export async function POST(req: any) {
	const { productId } = await req.json();
	console.log("===========>");
	console.log(productId);
	try {
		const result = await pool.query(
			"select * from  public.market_delete_product($1)",
			[productId]
		);

		if (result.rows[0]) {
			return NextResponse.json({
				message: "Your product is deleted successfully!",
				status: 200,
			});
		} else {
			throw new Error("Image uploading is failed");
		}
	} catch (error: any) {
		return NextResponse.json(
			{
				message: "Image uploading is failed",
			},
			{ status: 400 }
		);
	}
}
