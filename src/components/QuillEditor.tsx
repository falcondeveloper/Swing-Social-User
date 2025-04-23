import React, { forwardRef } from "react";
import ReactQuill, { Quill } from "react-quill";

// Define types for the props
interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  theme: string;
  style: React.CSSProperties;
  modules: {
    toolbar: any[];
  };
}

const QuillEditor = forwardRef<ReactQuill, QuillEditorProps>((props, ref) => {
  return <ReactQuill {...props} ref={ref} />;
});

export default QuillEditor;
