"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";
import { Item, ItemTitle, ItemContent } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
} from "recharts";
import { TriviaQuestion } from "./page";


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

const DIFFICULTY_COLORS = {
  easy: "#22c55e", // green
  medium: "#facc15", // yellow
  hard: "#ef4444", // red
};

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredData =
    selectedCategories.length > 0
      ? data.filter(({ category }) => selectedCategories.includes(category))
      : data;

  const categoryCounts = data.reduce<Record<string, number>>(
    (count, { category }) => {
      count[category] = (count[category] || 0) + 1;
      return count;
    },
    {}
  );

  const categoryData = useMemo(
    () =>
      Object.entries(categoryCounts)
        .map(([name, value], index) => ({
          name,
          value,
          fill: getRandomColor(index),
        }))
        .sort((a, b) => b.value - a.value),
    [categoryCounts]
  );

  const difficultyCounts = useMemo(
    () =>
      filteredData.reduce<Record<string, number>>((count, { difficulty }) => {
        count[difficulty] = (count[difficulty] || 0) + 1;
        return count;
      }, {}),
    [filteredData]
  );

  const difficultyOrder = ["easy", "medium", "hard"];
  const difficultyData = Object.entries(difficultyCounts)
    .map(([name, value]) => ({
      name,
      value,
      fill: DIFFICULTY_COLORS[name as keyof typeof DIFFICULTY_COLORS],
    }))
    .sort((a, b) => {
      const aIndex = difficultyOrder.indexOf(a.name);
      const bIndex = difficultyOrder.indexOf(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((c) => c !== category)
        : [...previous, category].length === categoryData.length
        ? []
        : [...previous, category]
    );
  };

  return (
    <div className="flex flex-col w-full">
      <Item className="flex flex-col items-start">
        <ItemContent>
          <ItemTitle className="text-2xl">
            Available question categories
          </ItemTitle>
          <ItemContent className="mb-2 text-muted-foreground text-sm">
            Select one or more categories to filter the charts below (you can
            also click on the bars in category chart).
          </ItemContent>
          <div className="flex flex-wrap gap-2 mb-2">
            {categoryData.map((category) => (
              <Button
                key={category.name}
                className={cn(
                  "category-filter-button",
                  selectedCategories.length > 0 &&
                    !selectedCategories.includes(category.name) &&
                    "opacity-50"
                )}
                style={{
                  backgroundColor: category.fill,
                }}
                onClick={() => toggleCategory(category.name)}
                type="button"
                tabIndex={0}
                aria-pressed={selectedCategories.includes(category.name)}
              >
                {category.name}
              </Button>
            ))}
            {selectedCategories.length > 0 && (
              <Button
                className={cn("category-filter-button", "sm:ml-2")}
                variant="outline"
                onClick={() => setSelectedCategories([])}
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
                accessibilityLayer
                data={categoryData.sort((a, b) => b.value - a.value)}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <p>{name}</p>
                        <p>Amount: {value}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" barSize={20}>
                  {categoryData.map((category) => {
                    const isSelected =
                      selectedCategories.length === 0 ||
                      selectedCategories.includes(category.name);
                    return (
                      <Cell
                        key={`cell-${category.name}`}
                        fill={category.fill}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category.name)}
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
                <BarChart
                  data={difficultyData}
                  accessibilityLayer
                >
                  <XAxis
                    dataKey="name"
                    type="category"
                    className="capitalize"
                  />
                  <YAxis type="number" width={20} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const { name, value } = payload[0].payload;
                      return (
                        <div className="chart-tooltip">
                          <p className="capitalize">
                            {name}: {value}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" barSize={60}>
                    {difficultyData.map((difficulty, index) => {
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={difficulty.fill}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
