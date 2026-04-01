import { forwardRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  readOnly?: boolean;
}

const HtmlEditor = forwardRef<ReactQuill, HtmlEditorProps>(
  ({ value, onChange, dir = "ltr", placeholder, readOnly = false }, ref) => {

    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],

      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],

      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']
    ];

    const modules = {
      toolbar: toolbarOptions
    };

    const formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "code-block",
      "list",
      "script",
      "indent",
      "direction",
      "size",
      "color",
      "background",
      "font",
      "align",
      "link",
      "image",
      "video",
    ];

    // Clean Quill HTML before saving
    const handleChange = (content: string) => {
      const cleaned = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','ul','ol','li','strong','em','u','a','blockquote','code','pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
      // remove Quill-specific spans and data attributes
      .replace(/<span class="ql-ui" contenteditable="false"><\/span>/g, '')
      .replace(/ data-list="[^"]*"/g, '');

      onChange(cleaned);
    };

    return (
      <div className="w-full">
        <ReactQuill
          ref={ref}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ direction: dir }}
        />
      </div>
    );
  }
);

HtmlEditor.displayName = "HtmlEditor";

export default HtmlEditor;
