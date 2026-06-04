import React from "react";

function AwardCard({ title, icon, name, value, desc }) {
  return (
    <div className="panel award-card">
      <div className="award-icon">{icon}</div>
      <div className="award-name">{name}</div>
      <div className="award-value">{value}</div>
      <small>{desc}</small>
    </div>
  );
}

export default AwardCard;