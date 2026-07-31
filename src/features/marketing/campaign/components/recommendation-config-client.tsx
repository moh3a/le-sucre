"use client";

import { useState } from "react";

const STRATEGIES = [
  { id: "trending", label: "Trending", desc: "Products with recent high engagement" },
  { id: "bestselling", label: "Bestselling", desc: "Top-selling products across the store" },
  { id: "new_arrivals", label: "New Arrivals", desc: "Recently added products" },
  { id: "top_rated", label: "Top Rated", desc: "Highest customer-rated products" },
  { id: "category_based", label: "Category Based", desc: "Products from a specific category" },
  { id: "brand_based", label: "Brand Based", desc: "Products from a specific brand" },
  {
    id: "personalized",
    label: "Personalized",
    desc: "User-specific recommendations based on browsing history",
  },
  {
    id: "frequently_bought",
    label: "Frequently Bought Together",
    desc: "Products commonly purchased together",
  },
];

export function RecommendationConfigClient() {
  const [selected, setSelected] = useState(STRATEGIES[0].id);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Recommendation Strategies</h1>
      <p className="text-sm text-gray-500">
        Available recommendation strategies for campaign sections and landing pages.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STRATEGIES.map((s) => (
          <div
            key={s.id}
            className={`cursor-pointer rounded-lg border p-4 transition ${selected === s.id ? "bg-blue-50 ring-2 ring-blue-500" : "hover:bg-gray-50"}`}
            onClick={() => setSelected(s.id)}
          >
            <h3 className="text-sm font-semibold">{s.label}</h3>
            <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
            <p className="mt-2 font-mono text-xs text-gray-400">{s.id}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4 text-sm text-gray-500">
        <p>
          Configure recommendation strategies in campaign sections via the section editor. Select a
          strategy type and set parameters like category ID, brand ID, or result limit in the
          section configuration.
        </p>
        <p className="mt-2">
          Recommendations are resolved at runtime by the{" "}
          <code className="rounded bg-gray-100 px-1 text-xs">campaign_recommendation_service</code>{" "}
          and can be cached for performance.
        </p>
      </div>
    </div>
  );
}
