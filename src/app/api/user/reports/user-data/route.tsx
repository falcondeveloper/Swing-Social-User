// Next Imports
import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

// PostgreSQL pool connection setup
const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { profileIds } = await req.json();

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { error: "ProfileIds is required" },
        { status: 400 }
      );
    }

    try {
      const profilesPromises = profileIds.map(async (id) => {
        try {
          const basicQuery = `SELECT * FROM public.web_one_profile($1)`;
          const basicResult = await pool.query(basicQuery, [id]);
          const profile = basicResult.rows[0];

          if (!profile) {
            console.warn(`No se encontró perfil para ID: ${id}`);
            return null;
          }

          if (!profile.ProfileId) {
            profile.ProfileId = id;
          }

          return profile;
        } catch (error) {
          console.warn(`Error obteniendo perfil básico para ID ${id}:`, error);
          return null;
        }
      });

      const profiles = (await Promise.all(profilesPromises)).filter((p) => p);

      if (profiles.length === 0) {
        return NextResponse.json(
          { error: "No se encontraron perfiles con los IDs proporcionados" },
          { status: 404 }
        );
      }

      const userPromises = profiles.map(async (profile) => {
        if (!profile || !profile.UserId) {
          return { ...profile, ProfileId: profile.ProfileId || profile.Id };
        }

        try {
          const userQuery = `SELECT "Email", "FirstName", "LastName" FROM public."Users" WHERE "Id" = $1`;
          const userResult = await pool.query(userQuery, [profile.UserId]);

          if (userResult.rows.length > 0) {
            const userData = userResult.rows[0];
            return {
              ...profile,
              Email: userData.Email,
              FirstName: userData.FirstName,
              LastName: userData.LastName,
              FullName: `${userData.FirstName || ""} ${
                userData.LastName || ""
              }`.trim(),
            };
          }

          return { ...profile, ProfileId: profile.ProfileId || profile.Id };
        } catch (error) {
          console.warn(
            `Error ${profile.UserId}:`,
            error
          );
          return { ...profile, ProfileId: profile.ProfileId || profile.Id };
        }
      });

      const enrichedUsers = (await Promise.all(userPromises)).map((user) => ({
        ProfileId: user.ProfileId || user.Id,
        Username: user.Username || "N/A",
        Email: user.Email || "N/A",
        Name: user.FullName || user.DisplayName || user.Username || "N/A",
        Avatar: user.Avatar || "",
        Phone: user.Phone || "N/A",
        DisplayName: user.DisplayName || "",
        FullName: user.FullName || "",
        FirstName: user.FirstName || "",
        LastName: user.LastName || "",
      }));
      return NextResponse.json({
        success: true,
        users: enrichedUsers,
        count: enrichedUsers.length,
      });
    } catch (dbError) {
      console.error("Error:", dbError);
      return NextResponse.json(
        {
          error: "Error",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
