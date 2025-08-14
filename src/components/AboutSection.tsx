import React, { useState } from "react";

interface AboutSectionProps {
  aboutText: string;
  charLimit?: number;
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
      return text;
    }
    return text.slice(0, charLimit) + "...";
  };

  const getFirstParagraph = (): string => {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(aboutText, "text/html");
    const firstParagraph = parsedHtml.body.querySelector("p");
    return firstParagraph ? firstParagraph.textContent || "" : "";
  };

  const truncatedText = truncateText(getFirstParagraph());

  return (
    <>
      <style>
        {`
          .about-container {
            text-align: center;
			padding: 5px 10px;
          }

          .about-text {
           font-size: 14px;
  		   color: #757575;
           margin: 0;
           word-wrap: break-word;
           white-space: pre-wrap;
           line-height: 1.4;
		   text-align: left;
          }

          .about-button {
            margin-top: 8px;
            font-size: 14px;
            background: none;
            border: none;
            color: #1976d2;
            cursor: pointer;
            text-transform: none;
            padding: 0;
          }

          .about-button:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div className="about-container">
        <p
          className="about-text"
          style={
            showFullText
              ? { whiteSpace: "pre-wrap" }
              : {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }
          }
        >
          {getFirstParagraph()}
        </p>
      </div>
    </>
  );
};

export default AboutSection;
