import React, { useState } from "react";
import { PageIntro, ClubBadge } from "./ClubUI";
import { clubLogo, clubBackground } from "../src/clubData";
import ImageDropzone from "./ImageDropzone";
export default function ClubInfoPage({
  clubInfo,
  setClubInfo,
  isAdmin,
  uploadImage,
}) {
  const [message, setMessage] = useState("");
  const change = (key, value) =>
    setClubInfo((previous) => ({ ...previous, [key]: value }));
  const upload = async (file, key) => {
    try {
      const url = await uploadImage(file, "club", key);
      change(key, url);
      setMessage("图片已上传，正在同步球队资料。");
    } catch (e) {
      setMessage(e.message);
      throw e;
    }
  };
  const fields = [
    ["name", "球队名称"],
    ["shortName", "球队简称"],
    ["city", "城市"],
    ["homeGround", "球队主场"],
    ["homeKit", "主场球衣"],
    ["awayKit", "客场球衣"],
    ["slogan", "球队口号"],
  ];
  return (
    <div className="match-page club-profile-page">
      <PageIntro
        en="OUR CLUB"
        title="江特FC · 我们的主场"
        text={clubInfo.slogan || "因热爱相聚，为球队而战。"}
      >
        <ClubBadge clubInfo={clubInfo} />
      </PageIntro>
      <section className="panel">
        <div className="brand-image-grid">
          <img
            style={{ width: "100%", height: 220, objectFit: "contain" }}
            src={clubLogo(clubInfo)}
            alt="江特FC队徽"
          />
          <img
            style={{ width: "100%", height: 220, objectFit: "contain" }}
            src={clubBackground(clubInfo)}
            alt="江特FC品牌背景"
          />
        </div>
        <h2 style={{ marginTop: 30 }}>关于江特FC</h2>
        <p>{clubInfo.description || "每一次并肩，都是新的足球故事。"}</p>
        <div className="profile-fact-grid">
          {fields
            .filter(([key]) => !["name", "shortName", "slogan"].includes(key))
            .map(([key, label]) => (
              <div className="profile-fact" key={key}>
                <span>{label}</span>
                <strong>{clubInfo[key] || "暂无记录"}</strong>
              </div>
            ))}
        </div>
      </section>
      {isAdmin && (
        <section className="panel">
          <h2>品牌与球队资料</h2>
          <div className="form-grid">
            {fields.map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={clubInfo[key] || ""}
                  onChange={(e) => change(key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <label>
            球队介绍
            <textarea
              value={clubInfo.description || ""}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
          <div className="brand-image-grid">
            <ImageDropzone
              title="球队logo"
              description="透明底PNG更适合导航展示"
              fit="contain"
              value={clubLogo(clubInfo)}
              onUpload={(file) => upload(file, "logo")}
              onDelete={() => change("logo", "")}
            />
            <ImageDropzone
              title="首页背景 / 球队合照"
              description="横版图片，建议宽度1600像素以上"
              fit="contain"
              value={clubBackground(clubInfo)}
              onUpload={(file) => upload(file, "background")}
              onDelete={() => change("background", "")}
            />
          </div>
          {message && <p role="status">{message}</p>}
        </section>
      )}
      <section className="panel">
        <h2>球队球衣</h2>
        <div className="kit-image-grid">
          {[
            ["homeKitImage", "主场球衣"],
            ["awayKitImage", "客场球衣"],
            ["thirdKitImage", "第三球衣"],
          ].map(([key, title]) => (
            <div key={key}>
              {isAdmin ? (
                <ImageDropzone
                  title={title}
                  value={clubInfo[key]}
                  fit="contain"
                  description="上传球衣图片"
                  onUpload={(file) => upload(file, key)}
                  onDelete={() => change(key, "")}
                />
              ) : (
                <div className="kit-image-card">
                  <h3>{title}</h3>
                  {clubInfo[key] ? (
                    <img
                      src={clubInfo[key]}
                      alt={title}
                      style={{
                        height: 240,
                        width: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <p>暂无图片</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {isAdmin && (
        <section className="panel">
          <h2>合作伙伴</h2>
          <p>
            每行一位合作伙伴，支持“名称 | 图片URL”；未填写时前台展示待公布。
          </p>
          <textarea
            aria-label="合作伙伴"
            value={(clubInfo.sponsors || [])
              .map((s) => s.name + (s.image ? " | " + s.image : ""))
              .join("\n")}
            onChange={(e) =>
              change(
                "sponsors",
                e.target.value
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => {
                    const [name, image] = line.split("|").map((s) => s.trim());
                    return { name, image: image || "" };
                  }),
              )
            }
          />
        </section>
      )}
    </div>
  );
}
