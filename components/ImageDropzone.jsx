import React, { useRef, useState } from "react";

function ImageDropzone({ title, description, value, onUpload, onDelete, uploading = false, fit = "cover" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [localUploading, setLocalUploading] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setStatus("请选择 JPG、PNG、WebP 等图片文件");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus("图片不能超过 8MB");
      return;
    }
    if (!onUpload) {
      setStatus("上传功能尚未配置");
      return;
    }

    try {
      setLocalUploading(true);
      setStatus("正在上传到 Supabase...");
      await onUpload(file);
      setStatus("上传成功，正在同步云端数据");
    } catch (error) {
      setStatus(`上传失败：${error?.message || "请检查 Supabase Storage 配置"}`);
    } finally {
      setLocalUploading(false);
    }
  };

  const isUploading = uploading || localUploading;

  return (
    <div
      className={`image-dropzone ${dragging ? "dragging" : ""} ${value ? "has-image" : ""}`}
      data-content-editor-ignore
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        upload(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={false}
        hidden
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {value ? (
        <img src={value} alt={`${title}预览`} style={{ objectFit: fit }} />
      ) : (
        <div className="image-dropzone-icon">＋</div>
      )}

      <div className="image-dropzone-copy">
        <strong>{isUploading ? "正在上传..." : title}</strong>
        <span>{isUploading ? "请稍候，上传完成后会自动保存" : description}</span>
      </div>

      <div className="image-dropzone-actions">
        <span>{value ? "点击或拖入图片替换" : "点击选择或拖入图片"}</span>
        {value && onDelete && (
          <button
            type="button"
            className="small-ghost-btn"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            删除
          </button>
        )}
      </div>
      {status && <div className={`image-dropzone-status ${status.includes("失败") ? "error" : ""}`}>{status}</div>}
    </div>
  );
}

export default ImageDropzone;
