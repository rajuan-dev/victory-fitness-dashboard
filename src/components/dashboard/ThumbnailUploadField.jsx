import { Button, Form, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const toneClassMap = {
  light: {
    container: "rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm",
    eyebrow: "text-xs font-semibold uppercase tracking-[0.22em] text-blue-600",
    title: "mt-1 text-sm font-semibold text-slate-900",
    label: "font-medium text-slate-700",
    dragger: "rounded-2xl border-slate-200 bg-slate-50",
    preview: "mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm",
    empty: "mt-3 text-xs text-slate-500",
  },
  dark: {
    container: "rounded-2xl border border-[#334155] bg-[#111827] p-4",
    eyebrow: "text-[11px] font-black uppercase tracking-widest text-slate-300",
    title: "mt-1 text-sm font-semibold text-slate-100",
    label: "font-black text-[11px] uppercase tracking-widest text-slate-300",
    dragger: "rounded-2xl border-[#334155] bg-[#0f172a]",
    preview: "mt-4 overflow-hidden rounded-2xl border border-[#334155] bg-[#0f172a] shadow-sm",
    empty: "mt-3 text-xs text-slate-500",
  },
};

export default function ThumbnailUploadField({
  eyebrow = "Thumbnail",
  title,
  label = "Thumbnail Upload",
  fileList,
  onChange,
  onRemove,
  previewSrc = "",
  fallbackPreviewSrc = "",
  previewAlt = "Thumbnail preview",
  emptyText = "No thumbnail selected yet.",
  tone = "light",
  className = "",
}) {
  const toneClasses = toneClassMap[tone] || toneClassMap.light;
  const activePreview = previewSrc || fallbackPreviewSrc;

  return (
    <div className={`${toneClasses.container} ${className}`.trim()}>
      <div className="mb-4">
        <p className={toneClasses.eyebrow}>{eyebrow}</p>
        <h4 className={toneClasses.title}>{title}</h4>
      </div>

      <Form.Item label={<span className={toneClasses.label}>{label}</span>}>
        <Dragger
          accept="image/png,image/jpeg,image/webp"
          beforeUpload={() => false}
          multiple={false}
          fileList={fileList}
          onChange={onChange}
          onRemove={onRemove}
          className={toneClasses.dragger}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className={tone === "dark" ? "text-[#00e5ff]" : ""} />
          </p>
          <p className={`ant-upload-text ${tone === "dark" ? "text-slate-200" : ""}`}>
            Click or drag thumbnail image here
          </p>
          <p className={`ant-upload-hint ${tone === "dark" ? "text-slate-400" : ""}`}>
            Supports PNG, JPG, and WEBP. Adding a new image replaces the current one.
          </p>
        </Dragger>

        {activePreview ? (
          <div className={toneClasses.preview}>
            <img src={activePreview} alt={previewAlt} className="h-40 w-full object-cover" />
          </div>
        ) : (
          <p className={toneClasses.empty}>{emptyText}</p>
        )}

        {activePreview ? (
          <div className="mt-3 flex justify-end">
            <Button danger type="text" onClick={onRemove}>
              Remove thumbnail
            </Button>
          </div>
        ) : null}
      </Form.Item>
    </div>
  );
}
