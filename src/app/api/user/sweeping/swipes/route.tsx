// import { NextResponse } from "next/server";
// import { Pool } from "pg";
// export const dynamic = "force-dynamic";

// const pool = new Pool({
//   user: "clark",
//   host: "199.244.49.83",
//   database: "swingsocialdb",
//   password: "Bmw740il#$",
//   port: 5432,
// });

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get("id");

//     let query = `SELECT * FROM public.get_swipescreenhome($1)`;
//     const swipeResults = await pool.query(query, [userId]);

//     if (swipeResults?.rows?.length === 0) {
//       return NextResponse.json({
//         swipes: [],
//         message: "No profiles found",
//       });
//     }

//     return NextResponse.json({
//       swipes: swipeResults?.rows,
//     });
//   } catch (error) {
//     console.error("Database query failed:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    let query = `SELECT * FROM public.get_swipescreenhome_paginated($1, $2, $3)`;
    const swipeResults = await pool.query(query, [userId, limit, offset]);

    const countQuery = `SELECT COUNT(*) as total_count FROM public.get_swipescreenhome_paginated($1, 100000, 0)`;
    const countResult = await pool.query(countQuery, [userId]);

    if (swipeResults?.rows?.length === 0) {
      return NextResponse.json({
        swipes: [],
        message: "No profiles found",
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasMore: false,
        },
      });
    }

    const totalCount = parseInt(countResult.rows[0].total_count);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      swipes: swipeResults?.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
