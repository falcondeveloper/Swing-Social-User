import React from "react";

interface AboutSectionProps {
  aboutText: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ aboutText }) => {
  const getFirstParagraph = (): string => {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(aboutText || "", "text/html");
    const firstParagraph = parsedHtml.body.querySelector("p");
    return firstParagraph ? firstParagraph.textContent || "" : aboutText || "";
  };

  const text = getFirstParagraph();

  return (
    <>
      <style>{`
        .about-container {
          text-align: center;
          padding: 5px 10px;
        }
        .about-text {
          font-size: 14px;
          color: #757575;
          margin: 0;
          line-height: 1.4;
          text-align: left;
          word-break: break-word;

          /* --- 2-line clamp with ellipsis --- */
          display: -webkit-box;
          -webkit-line-clamp: 2;   /* show only 2 lines */
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          white-space: normal;     /* IMPORTANT: don't use pre-wrap or nowrap */
        }
      `}</style>

      <div className="about-container">
        <p className="about-text" title={text}>
          {text}
        </p>
      </div>
    </>
  );
};

export default AboutSection;
