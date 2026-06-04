import React from "react";

function AbilityRadarCard({ player }) {
  const radarItems = ["速度", "射门", "盘带", "传球", "防守", "体能"];
  const size = 260;

  // 简单的雷达图占位
  return (
    <div className="ability-radar-card">
      <div className="radar-chart-placeholder">
        <div className="radar-grid">
          {radarItems.map((item, index) => {
            const angle = (index * 60 * Math.PI) / 180;
            const value = player.attributes?.[item] || 0;
            const radius = (value / 100) * 100;
            const x = 130 + Math.cos(angle) * radius;
            const y = 130 + Math.sin(angle) * radius;
            
            return (
              <React.Fragment key={item}>
                <div
                  className="radar-point"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                  title={`${item}: ${value}`}
                />
                <div
                  className="radar-label"
                  style={{
                    left: `${130 + Math.cos(angle) * 120}px`,
                    top: `${130 + Math.sin(angle) * 120}px`,
                  }}
                >
                  {item}
                  <br />
                  <strong>{value}</strong>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="radar-legend">
        {radarItems.map((item) => (
          <div key={item} className="radar-legend-item">
            <span>{item}</span>
            <b className={player.attributes?.[item] >= 75 ? "elite" : player.attributes?.[item] >= 65 ? "good" : "weak"}>
              {player.attributes?.[item] || 0}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AbilityRadarCard;