import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const JWT_SECRET = "SwingSocialLesile";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: Request) {
  const { email } = await req.json();

  const query = `SELECT * FROM web_one_profile_email($1)`;
  const querybyUserName = `SELECT * FROM public.admin_getoneprofile_by_user($1)`;
  const lastOnline = `SELECT * From public.edit_profile_lastonline($1)`;

  try {
    const result = await pool.query(query, [email]);

    if (result.rows.length == 0) {
      const searchByUser = await pool.query(querybyUserName, [email]);

      if (searchByUser.rows.length == 0) {
        return NextResponse.json({
          message: "No registered users found. Please sign up on the homepage.",
          status: 404,
          profileId: null,
        });
      } else {
        const profileId = searchByUser?.rows[0].Id;
        const avatar = searchByUser?.rows[0].Avatar;
        const userName = searchByUser?.rows[0].Username;
        const membership =
          searchByUser?.rows[0].Title !== "Free Member" ? 1 : 0;
        const memberalarm = searchByUser?.rows[0].SwipeHelp;
        const token = jwt.sign(
          {
            profileId: profileId,
            profileName: userName,
            avatar: avatar,
            membership: membership,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        if (searchByUser) {
          await pool.query(lastOnline, [profileId]);
          return NextResponse.json({
            message: "Login successfully!",
            status: 200,
            jwtToken: token,
            currentAvatar: avatar,
            currentProfileId: profileId,
            currentuserName: userName,
            memberAlarm: memberalarm,
            memberShip: membership,
          });
        } else {
          return NextResponse.json({
            message: "The password you entered is incorrect.",
            status: 500,
            currentAvatar: null,
            currentProfileId: null,
            currentuserName: null,
          });
        }
      }
    } else {
      const profileId = result?.rows[0].Id;
      const avatar = result?.rows[0].Avatar;
      const userName = result?.rows[0].Username;
      const memberalarm = result?.rows[0].SwipeHelp;
      const membership = result?.rows[0].Title !== "Free Member" ? 1 : 0;

      const token = jwt.sign(
        {
          profileId: profileId,
          profileName: userName,
          avatar: avatar,
          membership: membership,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      if (profileId) {
        await pool.query(lastOnline, [profileId]);
        return NextResponse.json({
          message: "Logged in successfully!",
          status: 200,
          jwtToken: token,
          currentAvatar: avatar,
          currentProfileId: profileId,
          currentuserName: userName,
          memberAlarm: memberalarm,
          memberShip: membership,
        });
      } else {
        return NextResponse.json({
          message: "Your password is incorrect",
          status: 500,
          currentAvatar: null,
          currentProfileId: null,
          currentuserName: null,
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failure",
      },
      { status: 400 }
    );
  }
}
