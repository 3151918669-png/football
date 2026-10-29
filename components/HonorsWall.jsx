import React, { useState } from "react";
export default function HonorsWall({ clubInfo, setClubInfo, isAdmin }) {
  const [form, setForm] = useState({
    name: "",
    year: "",
    place: "",
    image: "",
  });
  const honors = clubInfo.honors || [];
  return (
    <>
      <section className="honors-wall">
        <span className="eyebrow">OUR HONOURS / 荣誉殿堂</span>
        <h2 style={{ marginTop: 15 }}>属于江特FC的高光时刻</h2>
        {honors.length ? (
          <div className="honors-grid">
            {honors.map((h) => (
              <article key={h.id}>
                {h.image ? (
                  <img src={h.image} alt={h.name} />
                ) : (
                  <span style={{ fontSize: 48 }}>☆</span>
                )}
                <p>{h.year || "年份待补充"}</p>
                <h3>{h.name}</h3>
                <strong>{h.place}</strong>
                {isAdmin && (
                  <button
                    className="small-ghost-btn"
                    onClick={() => {
                      if (confirm("移除此项荣誉？可从JSON备份恢复。"))
                        setClubInfo({
                          ...clubInfo,
                          honors: honors.filter((item) => item.id !== h.id),
                        });
                    }}
                  >
                    移除
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="honor-empty">
            <span>☆</span>
            <h3>荣誉之路，我们一起书写。</h3>
            <p>暂无已录入的球队荣誉。</p>
          </div>
        )}
      </section>
      {isAdmin && (
        <section className="panel" style={{ marginBottom: 25 }}>
          <h3>添加球队荣誉</h3>
          <div className="honor-admin-form">
            {[
              ["name", "赛事名称"],
              ["year", "年份或赛季"],
              ["place", "名次 / 奖项"],
              ["image", "荣誉图片URL（可选）"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <button
              className="primary-btn"
              onClick={() => {
                if (!form.name.trim()) return;
                setClubInfo({
                  ...clubInfo,
                  honors: [...honors, { ...form, id: crypto.randomUUID() }],
                });
                setForm({ name: "", year: "", place: "", image: "" });
              }}
            >
              添加荣誉
            </button>
          </div>
        </section>
      )}
    </>
  );
}
