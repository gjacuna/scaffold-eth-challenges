import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" /*target="_blank" rel="noopener noreferrer"*/>
      <PageHeader
        title="🌳 Koywe 🌳"
        //subTitle="Pledge your commitment to save the planet, put your money where your mouth is."
        style={{ cursor: "pointer" }}
        />
    </a>
  );
}
