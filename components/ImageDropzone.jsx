import React, { useRef, useState } from "react";

function ImageDropzone({ title, description, value, onUpload, onDelete, uploading = false, fit = "cover" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const upload = (file) => {
    if (file?.type?.startsWith("image/") && onUpload) onUpload(file);
  };

  return (
    <div
      className={`image-dropzone ${dragging ? "dragging" : ""} ${value ? "has-image" : ""}`}
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
        <strong>{uploading ? "正在上传..." : title}</strong>
        <span>{uploading ? "请稍候，上传完成后会自动保存" : description}</span>
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
    </div>
  );
}

export default ImageDropzone;
