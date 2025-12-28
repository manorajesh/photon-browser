import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IconChevronsLeft,
  IconFolder,
  IconList,
  IconPlus,
  IconX,
} from "./icons";

function flatten(node, depth = 0, out = []) {
  out.push({ node, depth });
  if (node.open && node.children)
    node.children.forEach((c) => flatten(c, depth + 1, out));
  return out;
}

const normalizeUrl = (input) => {
  const s = (input || "").trim();
  if (!s) return "about:blank";
  if (/^[a-zA-Z]+:\/\//.test(s) || s.startsWith("about:")) return s;
  if (s.includes(".") && !s.includes(" ")) return `https://${s}`;
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
};

const initialTree = [
  {
    id: "root",
    title: "Root",
    open: true,
    children: [
      {
        id: "section-interests",
        title: "INTERESTS",
        kind: "section",
        open: true,
        children: [
          {
            id: "folder-roman",
            title: "New Roman Research",
            open: true,
            children: [
              {
                id: "tab-roman-empire",
                title: "Roman Empire",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Roman_Empire",
              },
              {
                id: "tab-pax-romana",
                title: "Pax Romana",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Pax_Romana",
              },
              {
                id: "tab-marcus",
                title: "Marcus Aurelius",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Marcus_Aurelius",
              },
              {
                id: "tab-stoicism",
                title: "Stoicism",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Stoicism",
              },
              {
                id: "tab-epicureanism",
                title: "Epicureanism",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Epicureanism",
              },
              {
                id: "tab-monism",
                title: "Monism",
                meta: "Wikipedia",
                icon: "W",
                url: "https://en.wikipedia.org/wiki/Monism",
              },
            ],
          },
          {
            id: "folder-pizza",
            title: "New Pizza Place!",
            open: true,
            children: [
              {
                id: "tab-pasta",
                title: "Pasta Non Basta",
                meta: "Grupo Non Basta",
                icon: "P",
                url: "https://www.pastanonbasta.com/",
              },
              {
                id: "tab-menu",
                title: "Menu - Pasta Non Basta",
                meta: "Pasta Non Basta",
                icon: "P",
                url: "https://www.pastanonbasta.com/menu",
              },
            ],
          },
          {
            id: "folder-tea",
            title: "Our Picks of the 9 Best Teas for Anxiety",
            open: true,
            children: [
              {
                id: "tab-peppermint",
                title: "Effect of Peppermint Essence on Anxiety",
                meta: "Study",
                icon: "T",
                url: "https://pubmed.ncbi.nlm.nih.gov/29964310/",
              },
              {
                id: "tab-lavender",
                title: "The effects of lavender aromatherapy",
                meta: "Study",
                icon: "T",
                url: "https://pubmed.ncbi.nlm.nih.gov/31367537/",
              },
            ],
          },
          {
            id: "tab-github",
            title: "GitHub",
            meta: "github.com",
            icon: "G",
            url: "https://github.com/",
          },
          {
            id: "tab-konmari",
            title: "KonMari",
            meta: "tidying",
            icon: "K",
            url: "https://konmari.com/",
          },
        ],
      },
    ],
  },
];

const isTab = (n) => n?.id?.startsWith("tab-");
const isNote = (n) => n?.id?.startsWith("note-");
const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const getFaviconUrl = (url) => {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return null;
  }
};

export default function App() {
  const [tree, setTree] = useState(initialTree);
  const [activeTabId, setActiveTabId] = useState("tab-roman-empire");
  const [brokenFavicons, setBrokenFavicons] = useState(() => new Set());

  const rows = useMemo(() => flatten(tree[0], -1, []).slice(1), [tree]);

  const updateNode = useCallback((id, updater) => {
    const recur = (n) => {
      if (n.id === id) return updater(n);
      if (!n.children) return n;
      return { ...n, children: n.children.map(recur) };
    };
    setTree((t) => [recur(t[0])]);
  }, []);

  const findNode = (id) => {
    const walk = (n) => {
      if (n.id === id) return n;
      for (const c of n.children || []) {
        const r = walk(c);
        if (r) return r;
      }
      return null;
    };
    return walk(tree[0]);
  };

  const collectTabs = (node, out = []) => {
    if (isTab(node)) out.push(node);
    (node.children || []).forEach((c) => collectTabs(c, out));
    return out;
  };
  const getTabs = () => collectTabs(tree[0]);
  const activeTab = findNode(activeTabId);

  const addTab = useCallback(
    (url = "about:blank", { makeActive = true } = {}) => {
      const id = makeId("tab");
      const u = normalizeUrl(url);

      updateNode("root", (root) => ({
        ...root,
        children: [
          ...(root.children || []),
          { id, title: "New Tab", meta: "new", icon: "N", url: u },
        ],
      }));

      if (makeActive) {
        setActiveTabId(id);
      }
    },
    [updateNode]
  );

  const closeTab = (id) => {
    const tabs = getTabs().filter((t) => t.id !== id);
    const removeTab = (node) => {
      if (!node.children) return node;
      const children = node.children.filter((c) => c.id !== id).map(removeTab);
      return { ...node, children };
    };
    setTree((t) => [removeTab(t[0])]);

    if (activeTabId === id) {
      const next = tabs[tabs.length - 1] || null;
      if (next) {
        setActiveTabId(next.id);
      } else {
        addTab("about:blank", { makeActive: true });
      }
    }
  };

  const selectNode = (node) => {
    if (node.children?.length && !isTab(node)) {
      updateNode(node.id, (n) => ({ ...n, open: !n.open }));
      return;
    }
    if (isTab(node)) {
      setActiveTabId(node.id);
      const targetUrl = node.currentUrl || node.url;
      if (targetUrl)
        window.electronAPI?.loadUrl?.(normalizeUrl(targetUrl), node.id);
      return;
    }
    if (isNote(node) && node.url) {
      const parentId = node.parentId;
      if (parentId) setActiveTabId(parentId);
      updateNode(parentId, (n) => ({
        ...n,
        currentUrl: node.url,
        currentTrailId: node.id,
        open: true,
      }));
      window.electronAPI?.loadUrl?.(normalizeUrl(node.url), parentId);
    }
  };

  // --- Drag & drop reorder within Tabs folder ---
  const dragIdRef = useRef(null);

  const findWithParent = (id, node, parent = null) => {
    if (node.id === id) return { node, parent };
    for (const c of node.children || []) {
      const r = findWithParent(id, c, node);
      if (r) return r;
    }
    return null;
  };

  const reorderTabs = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const fromInfo = findWithParent(fromId, tree[0]);
    const toInfo = findWithParent(toId, tree[0]);
    if (!fromInfo?.parent || fromInfo.parent.id !== toInfo?.parent?.id) return;
    const parentId = fromInfo.parent.id;
    updateNode(parentId, (parent) => {
      const children = [...(parent.children || [])];
      const fromIdx = children.findIndex((t) => t.id === fromId);
      const toIdx = children.findIndex((t) => t.id === toId);
      if (fromIdx < 0 || toIdx < 0) return parent;
      const [moved] = children.splice(fromIdx, 1);
      children.splice(toIdx, 0, moved);
      return { ...parent, children };
    });
  };

  useEffect(() => {
    const api = window.electronAPI;
    const targetUrl = activeTab?.currentUrl || activeTab?.url;
    if (!api || !targetUrl) return;
    api.loadUrl(normalizeUrl(targetUrl), activeTab.id);
  }, [activeTab?.id, activeTab?.url, activeTab?.currentUrl]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return undefined;
    const offNavigate = api.onNavigate(({ tabId, url }) => {
      if (!tabId) return;
      setTree((t) => {
        const findById = (node, id) => {
          if (node.id === id) return node;
          for (const c of node.children || []) {
            const r = findById(c, id);
            if (r) return r;
          }
          return null;
        };
        const root = t[0];
        const tab = findById(root, tabId);
        if (!tab || tab.currentUrl === url) return t;

        const parentId = tab.currentTrailId || tabId;
        let newNoteId = null;

        const addChild = (node) => {
          if (node.id === parentId) {
            const children = [...(node.children || [])];
            const last = children[children.length - 1];
            if (last?.url === url) return node;
            newNoteId = makeId("note");
            children.push({
              id: newNoteId,
              parentId: node.id,
              title: url,
              meta: "Visited",
              url,
            });
            return { ...node, children, open: true };
          }
          if (!node.children) return node;
          const nextChildren = node.children.map(addChild);
          if (nextChildren === node.children) return node;
          return { ...node, children: nextChildren };
        };

        const updateTabNode = (node) => {
          if (node.id === tabId) {
            return {
              ...node,
              currentUrl: url,
              currentTrailId: newNoteId || node.currentTrailId,
              open: true,
            };
          }
          if (!node.children) return node;
          const nextChildren = node.children.map(updateTabNode);
          if (nextChildren === node.children) return node;
          return { ...node, children: nextChildren };
        };

        const withChild = addChild(root);
        const withTab = updateTabNode(withChild);
        return [withTab];
      });
    });
    const offTitle = api.onTitle(({ tabId, title }) => {
      if (!tabId) return;
      setTree((t) => {
        const findById = (node, id) => {
          if (node.id === id) return node;
          for (const c of node.children || []) {
            const r = findById(c, id);
            if (r) return r;
          }
          return null;
        };
        const root = t[0];
        const tab = findById(root, tabId);
        const targetId = tab?.currentTrailId;
        if (!targetId) return t;
        const updateNote = (node) => {
          if (node.id === targetId) {
            return { ...node, title: title || node.title };
          }
          if (!node.children) return node;
          const nextChildren = node.children.map(updateNote);
          if (nextChildren === node.children) return node;
          return { ...node, children: nextChildren };
        };
        return [updateNote(root)];
      });
    });
    const offNewWindow = api.onNewWindow(({ url }) => {
      addTab(url || "about:blank", { makeActive: true });
    });
    return () => {
      offNavigate?.();
      offTitle?.();
      offNewWindow?.();
    };
  }, [addTab, updateNode]);

  return (
    <div className="window">
      <div className="sidebar">
        <div className="sidebarTop">
          <div className="sidebarTopRow">
            <div className="appTitle" />
            <div className="topActions">
              <button className="iconBtn ghost" type="button" title="Folders">
                <IconFolder />
              </button>
              <button className="iconBtn ghost" type="button" title="List">
                <IconList />
              </button>
              <button
                className="iconBtn"
                title="New Tab"
                onClick={() => addTab("about:blank")}
                type="button"
              >
                <IconPlus />
              </button>
              <button className="iconBtn ghost" type="button" title="Collapse">
                <IconChevronsLeft />
              </button>
            </div>
          </div>
        </div>

        <div className="tree">
          {rows.map(({ node, depth }) => {
            const isFolder = !!node.children?.length;
            const isSection = node.kind === "section";
            const active = node.id === activeTabId;
            const icon = node.icon || (isFolder ? "▢" : node.url ? "W" : "•");
            const faviconUrl = node.url ? getFaviconUrl(node.url) : null;
            const showFavicon = faviconUrl && !brokenFavicons.has(node.id);

            const draggable = isTab(node);
            return (
              <div
                key={node.id}
                className={`row ${isSection ? "section" : ""} ${
                  active ? "active" : ""
                }`}
                style={{ paddingLeft: `${Math.max(0, depth) * 16 + 10}px` }}
                onClick={() => selectNode(node)}
                draggable={draggable}
                onDragStart={(e) => {
                  if (!draggable) return;
                  dragIdRef.current = node.id;
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!draggable) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (!draggable) return;
                  e.preventDefault();
                  reorderTabs(dragIdRef.current, node.id);
                  dragIdRef.current = null;
                }}
              >
                {isFolder ? (
                  <span className="caret">{node.open ? "▾" : "▸"}</span>
                ) : (
                  <span className="caretSpacer" />
                )}
                <span
                  className={`fav ${node.url ? "favSite" : "favDim"} ${
                    showFavicon ? "hasImg" : ""
                  }`}
                >
                  {!isSection && (
                    <>
                      {showFavicon && (
                        <img
                          src={faviconUrl}
                          alt=""
                          onError={() =>
                            setBrokenFavicons((prev) => {
                              const next = new Set(prev);
                              next.add(node.id);
                              return next;
                            })
                          }
                        />
                      )}
                      <span className="favLetter">{icon}</span>
                    </>
                  )}
                </span>
                <span className="title">{node.title}</span>
                {node.meta && !isSection && (
                  <span className="sub">{node.meta}</span>
                )}

                {isTab(node) && (
                  <button
                    className="closeBtn"
                    title="Close"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      closeTab(node.id);
                    }}
                  >
                    <IconX />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="content">
        <div className="webwrap" />
      </div>
    </div>
  );
}
