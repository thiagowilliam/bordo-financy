import { CategoryRow, type CategoryRowProps } from "@/components/molecules/category-row";
import { cn } from "@/lib/utils";

export type CategoryListItem = CategoryRowProps & { id: string };

export type CategoryListProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: CategoryListItem[];
};

/** Card with the category rows separated by inset dividers. */
export function CategoryList({ items, className, ...props }: CategoryListProps) {
  return (
    <div
      className={cn("overflow-clip rounded-xl border border-border bg-card", className)}
      {...props}
    >
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma categoria</p>
      ) : (
        <ul>
          {items.map(({ id, ...row }) => (
            <li
              key={id}
              className="relative not-first:after:absolute not-first:after:inset-x-5 not-first:after:top-0 not-first:after:h-px not-first:after:bg-border not-first:after:content-['']"
            >
              <CategoryRow {...row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
