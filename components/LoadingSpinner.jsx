import React from "react";

function LoadingSpinner({ size = "medium", text = "加载中..." }) {
  const sizeClass = {
    small: "loading-spinner-small",
    medium: "loading-spinner-medium",
    large: "loading-spinner-large",
  }[size] || "loading-spinner-medium";

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner"></div>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
}

function ErrorMessage({ message, onRetry = null }) {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <strong>出错了</strong>
        <p>{message}</p>
        {onRetry && (
          <button className="small-ghost-btn" onClick={onRetry}>
            重试
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, text, icon = "📊" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export { LoadingSpinner, ErrorMessage, EmptyState };