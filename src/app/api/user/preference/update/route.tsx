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

export async function POST(req: any) {
  const { loginId, payload } = await req.json();

  const qCouples = payload.swiping.couples === true ? 1 : 0;
  const qSingleMales = payload.swiping.singleMale === true ? 1 : 0;
  const qSingleFemales = payload.swiping.singleFemale === true ? 1 : 0;
  const qblockCouples = payload.block.couples === true ? 1 : 0;
  const qblocksinglemales = payload.block.singleMale === true ? 1 : 0;
  const qblocksinglefemales = payload.block.singleFemale === true ? 1 : 0;
  const qdinstance = payload?.maxDistance;
  const quseDistance = payload.distanceChecked === true ? 1 : 0;
  const qcityState = payload.city;

  try {
    const result = await pool.query(
      "SELECT * FROM public.insert_preference($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        loginId,
        qCouples,
        qSingleMales,
        qSingleFemales,
        0,
        qblockCouples,
        qblocksinglemales,
        qblocksinglefemales,
        qcityState,
        quseDistance,
        qdinstance,
      ]
    );

    if (result.rows[0]) {
      return NextResponse.json({
        message: "Your preference is updated successfully!",
        status: 200,
      });
    } else {
      throw new Error("Sorry, your updating is failed!");
    }
  } catch (error: any) {
    return NextResponse.json({
      message: "Sorry, your updating is failed!",
      status: 400,
    });
  }
}
