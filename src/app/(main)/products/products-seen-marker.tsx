"use client";

import { useEffect, useRef } from "react";
import { markProductsSeenAction } from "@/lib/products/actions";

export function ProductsSeenMarker() {
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markProductsSeenAction();
  }, []);

  return null;
}
