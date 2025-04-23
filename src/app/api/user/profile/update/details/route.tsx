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
	const {
		ProfileId,
		Username,
		Age,
		Gender,
		Location,
		Tagline, // Default null for date fields
		About,
		BodyType,
		HairColor,
		EyeColor,
		ProfileBanner,
		SwingStyle,
		Avatar,
		AccountType,
		Orientation,
		ProfileImages,
		PrivateImages,
		PartnerAge,
		PartnerGender,
		PartnerBodyType,
		PartnerHairColor,
		PartnerEyeColor,
		PartnerSexualOrientation,
	} = await req.json();

	console.log(
		ProfileId,
		Username,
		Age,
		Gender,
		Location,
		Tagline, // Default null for date fields
		About,
		BodyType,
		EyeColor,
		HairColor,
		SwingStyle,
		Orientation,
		ProfileImages,
		PrivateImages,
		Avatar,
		ProfileBanner
	);

	const today = new Date(); // Get today's date
	const currentYear = today.getFullYear(); // Get the current year
	const currentMonth = today.getMonth(); // Get the current month (0-indexed, e.g., January is 0)
	const currentDate = today.getDate(); // Get the current date

	const birthYear = currentYear - Age;
	const birthDay = new Date(birthYear, currentMonth, currentDate);

	const pBirthYear = currentYear - PartnerAge;
	const pBirthDay = new Date(pBirthYear, currentMonth, currentDate);

	const swingStyleFormatted = Object.keys(SwingStyle)
		.filter((key) => SwingStyle[key]) // Filter only the keys with `true` values
		.map((key) => `'${key}'`) // Wrap each key in single quotes
		.join(","); // Join them with commas

	console.log("Formatted SwingStyle:", swingStyleFormatted); // Debugging output

	try {
		const updateUserNameQuery =
			"SELECT * FROM public.web_update_username($1, $2)";
		const updateDetailQuery =
			"SELECT * FROM public.edit_profile_details1($1, $2, $3, $4, $5 ,$6, $7, $8, $9, $10, $11)";
		const updateTaglineQuery =
			"SELECT * FROM public.edit_profile_tagline($1, $2)";
		const updateAboutQuery = "SELECT * FROM public.edit_profile_about($1, $2)";
		const updateAvatarQuery =
			"SELECT * FROM public.edit_profile_avatar($1, $2)";
		const updateBannerQuery =
			"SELECT * FROM public.edit_profile_banner($1, $2)";
		const updateSwingStyleQuery =
			"SELECT * FROM public.edit_profile_swingstyle($1, $2)";
		const updatePartnerQuery =
			"SELECT * FROM public.edit_profile_details2($1, $2, $3, $4, $5 ,$6, $7, $8, $9)";

		const updateUserNameResult = await pool.query(updateUserNameQuery, [
			ProfileId,
			Username,
		]);

		const updateDetailResult = await pool.query(updateDetailQuery, [
			ProfileId,
			Gender,
			Orientation,
			birthDay,
			BodyType,
			"",
			"",
			HairColor,
			EyeColor,
			AccountType,
			Location,
		]);

		const updatePartnerResult = await pool.query(updatePartnerQuery, [
			ProfileId,
			PartnerGender,
			PartnerSexualOrientation,
			pBirthDay,
			PartnerBodyType,
			"",
			"",
			PartnerHairColor,
			PartnerEyeColor,
		]);

		const updateSwingStyleResult = await pool.query(updateSwingStyleQuery, [
			ProfileId,
			swingStyleFormatted,
		]);

		const updateTaglineResult = await pool.query(updateTaglineQuery, [
			ProfileId,
			Tagline,
		]);

		const updateAboutResult = await pool.query(updateAboutQuery, [
			ProfileId,
			About,
		]);

		if (Avatar) {
			const updateAvatarResult = await pool.query(updateAvatarQuery, [
				ProfileId,
				Avatar,
			]);
		}

		if (ProfileBanner) {
			const updateBannerResult = await pool.query(updateBannerQuery, [
				ProfileId,
				ProfileBanner,
			]);
		}

		return NextResponse.json({
			message: "Your profile is updated successfully!",
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({
			message: "Relationship Category Update failed",
			status: 400,
		});
	}

	// try {
	//     // Call `edit_profile_details1`
	//     const result1 = await pool.query(
	//         'SELECT * FROM edit_profile_details1($1, $2, $3, $4, $5, $6, $7, $8, $9)',
	//         [
	//              ProfileId,
	//             Gender,
	//             orientation,
	//             birthday,
	//             bodyType,
	//             alcoholStatus,
	//             marijuanaStatus,
	//             hairColor,
	//             eyeColor,
	//         ]
	//     );
	//     console.log('Result 1:', result1);

	//     // Call `edit_profilepage2`
	//     const result2 = await pool.query(
	//         'SELECT * FROM edit_profilepage2($1, $2, $3, $4, $5)',
	//         [pid, gender, orientation, birthday, bodyType]
	//     );
	//     console.log('Result 2:', result2);

	//     // Call `edit_profilepage3`
	//     const result3 = await pool.query(
	//         'SELECT * FROM edit_profilepage3($1, $2, $3, $4, $5, $6, $7, $8, $9)',
	//         [pid, gender, orientation, birthday, bodyType, eyeColor, hairColor, ft, inches]
	//     );
	//     console.log('Result 3:', result3);

	//     // Call `edit_profilepage4`
	//     const result4 = await pool.query(
	//         'SELECT * FROM edit_profilepage4($1, $2, $3)',
	//         [pid, avatar, banner]
	//     );
	//     console.log('Result 4:', result4);

	//     return NextResponse.json({
	//         message: 'Profile updated successfully',
	//     });
	// } catch (error: any) {
	//     console.error('Error updating profile:', error);
	//     return NextResponse.json(
	//         {
	//             message: 'Profile Update failed',
	//             error: error.message,
	//         },
	//         { status: 400 }
	//     );
	// }
}
