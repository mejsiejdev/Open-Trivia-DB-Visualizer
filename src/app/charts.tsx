"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";
import { Item, ItemTitle, ItemContent } from "@/components/ui/item";
import { useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
} from "recharts";

interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const categoryChartConfig = {
  value: {
    label: "Amount",
    color: "#fff",
  },
} satisfies ChartConfig;

const difficultyChartConfig = {
  value: {
    label: "Difficulty",
    color: "#fff",
  },
} satisfies ChartConfig;

const COLOR_PALETTE = [
  "#3B82F6",
  "#F59E42",
  "#EF4444",
  "#06B6D4",
  "#22C55E",
  "#EAB308",
  "#A855F7",
  "#F472B6",
  "#F97316",
  "#64748B",
  "#14B8A6",
  "#0EA5E9",
  "#8B5CF6",
  "#FF38B0",
  "#FBBF24",
  "#DB2777",
  "#D946EF",
  "#10B981",
  "#3B3B98",
  "#DC2626",
];
const getRandomColor = (index: number) =>
  COLOR_PALETTE[index % COLOR_PALETTE.length];

export function Charts({ data }: { data: TriviaQuestion[] }) {
  // Use array for multiple selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter data by selectedCategories if any are set
  const filteredData =
    selectedCategories.length > 0
      ? data.filter((q) => {
          let cat = q.category ? q.category.replace(/&amp;/g, "&") : "Unknown";
          cat = cat.includes(":") ? cat.split(":")[0].trim() : cat;
          return selectedCategories.includes(cat);
        })
      : data;

  // Count questions per category (always use all data for categories)
  const categoryCounts = data.reduce<Record<string, number>>((acc, q) => {
    let cat = q.category ? q.category.replace(/&amp;/g, "&") : "Unknown";
    cat = cat.includes(":") ? cat.split(":")[0].trim() : cat;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCounts).map(
    ([name, value], index) => ({
      name,
      value,
      fill: getRandomColor(index),
    })
  );

  // Count questions per difficulty (filtered by selectedCategories)
  const difficultyCounts = filteredData.reduce<Record<string, number>>(
    (acc, q) => {
      const diff = q.difficulty || "unknown";
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    },
    {}
  );
  const difficultyData = Object.entries(difficultyCounts).map(
    ([name, value], index) => ({
      name,
      value,
      fill: getRandomColor(index),
    })
  );

  // Toggle category selection
  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  // Clear all selections
  const clearSelection = () => setSelectedCategories([]);

  return (
    <div className="flex flex-col w-full">
      <Item className="flex flex-col items-start">
        <ItemContent>
          <ItemTitle className="text-2xl">
            Available question categories
          </ItemTitle>
          <ItemContent className="mb-2 text-muted-foreground text-sm">
            Select one or more categories to filter the difficulty chart below.
          </ItemContent>
          <div className="flex flex-wrap gap-2 mb-2">
            {categoryData.map((cat) => (
              <Button
                key={cat.name}
                className={`px-3 py-1 text-sm font-medium transition-opacity cursor-pointer text-white ${
                  selectedCategories.length > 0 &&
                  !selectedCategories.includes(cat.name)
                    ? "opacity-50"
                    : ""
                }`}
                style={{
                  backgroundColor: cat.fill,
                }}
                onClick={() => toggleCategory(cat.name)}
                type="button"
                tabIndex={0}
                aria-pressed={selectedCategories.includes(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
            {selectedCategories.length > 0 && (
              <Button
                className="px-3 py-1 text-sm font-medium ml-2 cursor-pointer"
                variant="outline"
                onClick={clearSelection}
                type="button"
              >
                Clear
              </Button>
            )}
          </div>
        </ItemContent>
      </Item>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <Card className="h-min">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Number of questions in these categories:{" "}
              {selectedCategories.length > 0
                ? filteredData.length
                : data.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={categoryChartConfig}
              className="min-h-[500px] h-full w-full"
            >
              <BarChart
                layout="vertical"
                height={categoryData.length * 40}
                accessibilityLayer
                data={[...categoryData].sort((a, b) => b.value - a.value)}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-300 text-black rounded-md p-2 text-sm shadow-sm">
                        <p>{name}</p>
                        <p>Amount: {value}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" barSize={20}>
                  {[...categoryData]
                    .sort((a, b) => b.value - a.value)
                    .map((entry) => {
                      const isSelected =
                        selectedCategories.length === 0 ||
                        selectedCategories.includes(entry.name);
                      return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={entry.fill}
                          opacity={isSelected ? 1 : 0.4}
                        />
                      );
                    })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="h-min">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Question difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={difficultyChartConfig}
              className="min-h-[300px] sm:min-h-[500px] h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    m
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    className="capitalize"
                  >
                    {difficultyData.map((entry, index) => {
                      let fill = entry.fill;
                      if (entry.name === "easy") fill = "#22c55e";
                      else if (entry.name === "medium") fill = "#facc15";
                      else if (entry.name === "hard") fill = "#ef4444";
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Pie>
                  <Legend className="capitalize" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const { name, value } = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-300 text-black rounded-md p-2 text-sm shadow-sm">
                          <p className="capitalize">
                            {name}: {value}
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
