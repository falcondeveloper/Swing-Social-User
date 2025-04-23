import React, { useState } from "react";
import { Typography, Button, Box } from "@mui/material";

interface AboutSectionProps {
	aboutText: string;
	charLimit?: number; // Optional character limit
}

const AboutSection: React.FC<AboutSectionProps> = ({
	aboutText,
	charLimit = 65,
}) => {
	const [showFullText, setShowFullText] = useState(false);

	const toggleText = () => {
		setShowFullText(!showFullText);
	};

	const truncateText = (text: string): string => {
		if (showFullText || text.length <= charLimit) {
			return text; // Show full text if toggled or within limit
		}
		return text.slice(0, charLimit) + "..."; // Truncate and add ellipsis
	};

	const getFirstParagraph = (): string => {
		const parser = new DOMParser();
		const parsedHtml = parser.parseFromString(aboutText, "text/html");
		const firstParagraph = parsedHtml.body.querySelector("p");
		return firstParagraph ? firstParagraph.textContent || "" : ""; // Return plain text of the first paragraph
	};

	const truncatedText = truncateText(getFirstParagraph());

	return (
		<Box style={{ textAlign: "center" }}>
			{/* Render Truncated Text */}
			<Typography variant="body2" color="secondary">
				{truncatedText}
			</Typography>

			{/* Read More / Show Less Button */}
			{aboutText?.length > charLimit && (
				<Button
					size="small"
					sx={{ textTransform: "none", marginTop: 1 }}
					onClick={toggleText}
				></Button>
			)}
		</Box>
	);
};

export default AboutSection;
