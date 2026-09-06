"use client";

import { Children, useState, type ReactNode } from "react";
import ShowMore from "@/components/ShowMore";

// Renders `children` (a list of already-rendered elements) collapsed to `limit`,
// with a "show more →" toggle that reveals the rest. The children stay
// server-rendered — this wrapper only slices the array — so heavy deps used
// inside them (e.g. react-markdown) never reach the client bundle.
export default function CollapsibleList({
  children,
  limit,
  buttonClassName = "mt-10",
}: {
  children: ReactNode;
  limit: number;
  buttonClassName?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const items = Children.toArray(children);
  const visible = showAll ? items : items.slice(0, limit);

  return (
    <>
      {visible}
      {items.length > limit && (
        <ShowMore
          expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          className={buttonClassName}
        />
      )}
    </>
  );
}
