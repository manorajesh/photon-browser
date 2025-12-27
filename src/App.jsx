import React, { useMemo, useState } from "react";

const seed = [
  {
    id: "interests",
    title: "INTERESTS",
    kind: "section",
    children: [
      {
        id: "roman",
        title: "New Roman Research",
        open: true,
        children: [
          {
            id: "wiki-rome",
            title: "Roman Empire",
            subtitle: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Roman_Empire",
          },
          {
            id: "wiki-pax",
            title: "Pax Romana",
            subtitle: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Pax_Romana",
          },
          {
            id: "wiki-marcus",
            title: "Marcus Aurelius",
            subtitle: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Marcus_Aurelius",
          },
          {
            id: "stoic",
            title: "Stoicism",
            subtitle: "Wikipedia",
            url: "https://en.wikipedia.org/wiki/Stoicism",
            open: true,
            children: [
              {
                id: "epi",
                title: "Epicureanism",
                subtitle: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Epicureanism",
              },
              {
                id: "monism",
                title: "Monism",
                subtitle: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Monism",
              },
            ],
          },
        ],
      },
      {
        id: "pizza",
        title: "New Pizza Place!",
        open: true,
        children: [
          {
            id: "pasta",
            title: "Pasta Non Basta",
            subtitle: "Grupo Non Basta",
            url: "https://example.com",
          },
          {
            id: "menu",
            title: "Menu - Pasta Non Basta",
            subtitle: "",
            url: "https://example.com",
          },
        ],
      },
      {
        id: "tea",
        title: "Our Picks of the 9 Best Teas for Anxiety",
        open: true,
        children: [
          {
            id: "peppermint",
            title: "Effect Of Peppermint Essence On The",
            subtitle: "",
            url: "https://example.com",
          },
          {
            id: "lavender",
            title: "The effects of lavender aromatherap",
            subtitle: "",
            url: "https://example.com",
          },
        ],
      },
      {
        id: "github",
        title: "GitHub",
        subtitle: "",
        url: "https://github.com",
      },
      {
        id: "konmari",
        title: "KonMari",
        subtitle: "",
        url: "https://konmari.com",
      },
    ],
  },
];

function flatten(node, depth = 0, out = []) {
  if (!node) return out;
  out.push({ node, depth });
  if (node.open && node.children)
    node.children.forEach((c) => flatten(c, depth + 1, out));
  return out;
}

export default function App() {
  const [tree, setTree] = useState(seed);
  const [activeUrl, setActiveUrl] = useState("https://www.google.com"); // placeholder

  const rows = useMemo(() => flatten(tree[0], -1, []).slice(1), [tree]); // skip root wrapper

  const toggle = (id) => {
    const recur = (n) => {
      if (n.id === id) return { ...n, open: !n.open };
      if (!n.children) return n;
      return { ...n, children: n.children.map(recur) };
    };
    setTree((t) => [recur(t[0])]);
  };

  return (
    <div className="window">
      <div className="sidebar">
        <div className="sidebarTop">
          <div className="appTitle">
            <span className="horseIcon">🐴</span>
            <span className="appName">Horse</span>
            <span className="appSub">The Browser for Research</span>
          </div>
        </div>

        <div className="tree">
          {rows.map(({ node, depth }) => {
            const isFolder = !!node.children?.length;
            const isSection = node.kind === "section";
            return (
              <div
                key={node.id}
                className={`row ${isSection ? "section" : ""}`}
                style={{ paddingLeft: `${Math.max(0, depth) * 16 + 10}px` }}
                onClick={() => {
                  if (isFolder) toggle(node.id);
                  if (node.url) setActiveUrl(node.url);
                }}
              >
                {isFolder ? (
                  <span className={`caret ${node.open ? "open" : ""}`}>▾</span>
                ) : (
                  <span className="caretSpacer" />
                )}
                <span className="fav">{node.url ? "w" : "•"}</span>
                <span className="title">{node.title}</span>
                {node.subtitle ? (
                  <span className="sub">{node.subtitle}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="content">
        <div className="topbar">
          <div className="brand">
            <span className="horseIconSm">🐴</span>
            <span className="brandName">Horse</span>
            <span className="brandSub">The Browser for Research</span>
          </div>
          <div className="actions">
            <button className="buy">Buy</button>
            <button className="menu">Menu</button>
          </div>
        </div>

        <div className="webwrap">
          <webview
            className="webview"
            src={activeUrl}
            partition="persist:horse"
          />
        </div>
      </div>
    </div>
  );
}
