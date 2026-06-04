import React, { useEffect, useRef, useState } from "react";

const EDITABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
const IGNORED_TAGS = new Set(["SCRIPT", "STYLE", "INPUT", "TEXTAREA", "SELECT", "OPTION"]);

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function replaceTextNode(node, contentEdits) {
  const source = cleanText(node.nodeValue);
  if (!source || !contentEdits[source]) return;
  node.nodeValue = node.nodeValue.replace(source, contentEdits[source]);
}

function applyEdits(root, contentEdits) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!IGNORED_TAGS.has(node.parentElement?.tagName)) replaceTextNode(node, contentEdits);
    node = walker.nextNode();
  }

  root.querySelectorAll(EDITABLE_ATTRIBUTES.map((attr) => `[${attr}]`).join(",")).forEach((element) => {
    EDITABLE_ATTRIBUTES.forEach((attribute) => {
      const source = cleanText(element.getAttribute(attribute));
      if (source && contentEdits[source]) element.setAttribute(attribute, contentEdits[source]);
    });
  });
}

function getEditableText(target) {
  for (const node of target.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && cleanText(node.nodeValue)) {
      return { source: cleanText(node.nodeValue), type: "text" };
    }
  }

  for (const attribute of EDITABLE_ATTRIBUTES) {
    const value = cleanText(target.getAttribute?.(attribute));
    if (value) return { source: value, type: "attribute", attribute };
  }

  const fallback = cleanText(target.textContent);
  return fallback ? { source: fallback, type: "text" } : null;
}

function ContentEditor({ enabled, contentEdits, setContentEdits, children }) {
  const rootRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    applyEdits(root, contentEdits);
    const observer = new MutationObserver(() => applyEdits(root, contentEdits));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [contentEdits]);

  const handleClick = (event) => {
    if (!enabled || event.target.closest("[data-content-editor-ignore]")) return;

    const editable = getEditableText(event.target);
    if (!editable) {
      setMessage("这个区域没有可编辑文字，请直接点击具体文字。");
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const current = contentEdits[editable.source] || editable.source;
    const next = window.prompt("编辑文字内容", current);
    if (next === null) return;

    const normalized = next.trim();
    setContentEdits((previous) => {
      const updated = { ...previous };
      if (!normalized || normalized === editable.source) delete updated[editable.source];
      else updated[editable.source] = normalized;
      return updated;
    });
    setMessage(normalized ? "文字已保存。" : "已恢复默认文字。");
  };

  return (
    <div
      ref={rootRef}
      className={enabled ? "content-edit-mode" : ""}
      onClickCapture={handleClick}
    >
      {enabled && (
        <div className="content-edit-hint" data-content-editor-ignore>
          <strong>文字编辑模式已开启</strong>
          <span>{message || "点击页面上的任意文字即可修改，留空可恢复默认文字。"}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export default ContentEditor;
