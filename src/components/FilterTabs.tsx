type FilterValue = "all" | "active" | "completed";

interface FilterTabsProps {
  activeFilter: FilterValue;
  activeCount: number;
}

const filters: { label: string; value: FilterValue; href: string }[] = [
  { label: "All", value: "all", href: "/" },
  { label: "Active", value: "active", href: "?filter=active" },
  { label: "Completed", value: "completed", href: "?filter=completed" },
];

export default function FilterTabs({
  activeFilter,
  activeCount,
}: FilterTabsProps) {
  return (
    <nav className="flex items-center justify-between gap-2">
      <div className="flex gap-1">
        {filters.map(({ label, value, href }) => (
          <a
            key={value}
            href={href}
            className={
              activeFilter === value
                ? "rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            }
          >
            {label}
          </a>
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {activeCount} {activeCount === 1 ? "item" : "items"} left
      </span>
    </nav>
  );
}
