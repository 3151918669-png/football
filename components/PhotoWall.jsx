import React, { useRef, useEffect, useState } from "react";
import { SectionHead } from "./ClubUI";
import { externalUrl, publicImageUrl } from "../src/clubData";
export default function PhotoWall({ photos = [] }) {
  const rail = useRef(null),
    index = useRef(0);
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false);
  const move = (i) => {
    if (!photos.length) return;
    index.current = (i + photos.length) % photos.length;
    const children = rail.current?.children;
    if (children?.length)
      rail.current.scrollTo({
        left: children[index.current].offsetLeft - children[0].offsetLeft,
        behavior: reduced ? "auto" : "smooth",
      });
  };
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (photos.length < 2 || paused || reduced) return;
    const timer = setInterval(() => {
      if (!document.hidden) move(index.current + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length, paused, reduced]);
  return (
    <section className="photo-wall-section content-width">
      <SectionHead en="OUR MOMENTS" title="把并肩的时刻，留在这里" />
      <div className="photo-wall-heading">
        <p>江特FC · 球队合影墙</p>
        {photos.length > 1 && (
          <div className="rail-controls">
            <button
              aria-label="上一张合影"
              onClick={() => move(index.current - 1)}
            >
              ←
            </button>
            <button
              aria-label={paused ? "播放合影" : "暂停合影"}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "播放" : "暂停"}
            </button>
            <button
              aria-label="下一张合影"
              onClick={() => move(index.current + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
      {photos.length ? (
        <div
          ref={rail}
          className="photo-wall"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
        >
          {photos.map((photo, i) => (
            <figure key={photo.id || i}>
              <img
                src={publicImageUrl(photo.url)}
                alt={photo.caption || `江特FC球队合影 ${i + 1}`}
                loading="lazy"
              />
              <figcaption>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {photo.caption || "一起上场，一起珍藏。"}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="photo-wall-empty">
          <span>▧</span>
          <h3>下一张合影，记录我们的故事。</h3>
          <p>球队合影待上传 · 添加照片后可横向浏览与自动播放</p>
        </div>
      )}
    </section>
  );
}
export function GalleryManager({ photos, onChange, uploadImage }) {
  const [url, setUrl] = useState(""),
    [caption, setCaption] = useState(""),
    [status, setStatus] = useState("");
  const add = () => {
    const valid = externalUrl(url);
    if (!valid) {
      setStatus("请填写完整的 http 或 https 图片链接");
      return;
    }
    onChange([...photos, { id: crypto.randomUUID(), url: valid, caption }]);
    setUrl("");
    setCaption("");
    setStatus("合影已加入照片墙");
  };
  const upload = async (files) => {
    const added = [];
    try {
      setStatus("正在上传合影…");
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const uploaded = await uploadImage(file, "club-gallery", file.name);
        added.push({
          id: crypto.randomUUID(),
          url: uploaded,
          caption: file.name.replace(/\.[^.]+$/, ""),
        });
      }
      if (added.length) onChange([...photos, ...added]);
      setStatus(`已上传 ${added.length} 张合影`);
    } catch (error) {
      if (added.length) onChange([...photos, ...added]);
      setStatus(error.message);
    }
  };
  return (
    <section className="panel gallery-manager">
      <h2>球队合影墙</h2>
      <p>可上传多张照片或填写图片链接；前台按此顺序滚动播放。</p>
      <label className="upload-btn">
        上传合影（可多选）
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            upload(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </label>
      <div className="form-grid">
        <label>
          合影图片链接
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label>
          合影说明
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
      </div>
      <button className="primary-btn" onClick={add}>
        添加到照片墙
      </button>
      <p role="status">{status}</p>
      <div className="gallery-admin-list">
        {photos.map((p, i) => (
          <div key={p.id || i}>
            <img src={publicImageUrl(p.url)} alt={p.caption || "球队合影"} />
            <input
              aria-label={`第${i + 1}张合影说明`}
              value={p.caption || ""}
              onChange={(e) =>
                onChange(
                  photos.map((item, n) =>
                    n === i ? { ...item, caption: e.target.value } : item,
                  ),
                )
              }
            />
            <button
              disabled={!i}
              onClick={() => {
                const next = [...photos];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                onChange(next);
              }}
            >
              前移
            </button>
            <button onClick={() => onChange(photos.filter((_, n) => n !== i))}>
              移除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
