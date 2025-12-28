import React from "react";

const baseProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconFolder(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function IconList(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconChevronsLeft(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M11 7l-5 5 5 5M18 7l-5 5 5 5" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
