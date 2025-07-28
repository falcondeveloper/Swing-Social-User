import { Editor } from "@tinymce/tinymce-react";

interface EditorProps {
    description: string;
    handleEditorChange: (field: string, content: string) => void;
}

const MyEditor: React.FC<EditorProps> = ({ description, handleEditorChange }) => {
    return (
        <Editor
            apiKey="3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"
            value={description}
            onEditorChange={(content) => handleEditorChange("description", content)}
            init={{
                menubar: false,
                toolbar: "bold italic",
                statusbar: false,
                plugins: ["advlist", "autolink", "lists", "link", "image"],
                content_style: `
                    body {
                        background-color: #2d2d2d; 
                        color: white; 
                    }
                    .mce-content-body {
                        background-color: #282828;
                        color: white;
                    }
                `,
                skin: false, // Disable default skin to apply custom styles
                skin_url: "false", // Ensure no default skin CSS is applied
                setup: (editor) => {
                    editor.on("init", () => {
                        // Type-safe DOM manipulation for TinyMCE elements
                        const toolbar = editor.getContainer()?.querySelector<HTMLDivElement>(".tox-toolbar");
                        const header = editor.getContainer()?.querySelector<HTMLDivElement>(".tox-editor-header");

                        if (toolbar) toolbar.style.backgroundColor = "#282828";
                        if (header) header.style.backgroundColor = "#282828";
                    });
                },
            }}
        />
    );
};

export default MyEditor;
