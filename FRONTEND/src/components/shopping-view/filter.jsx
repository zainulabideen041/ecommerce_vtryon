import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

function ProductFilter({ filters, handleFilter }) {
  const getActiveFiltersCount = (keyItem) => {
    return filters && filters[keyItem] ? filters[keyItem].length : 0;
  };

  return (
    <div className="bg-card rounded-2xl border-2 shadow-sm sticky top-20">
      <div className="p-6 border-b">
        <h2 className="text-xl font-display font-bold">Filters</h2>
        <p className="text-sm text-muted-foreground mt-1">Refine your search</p>
      </div>
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.keys(filterOptions).map((keyItem, index) => (
          <Fragment key={keyItem}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold capitalize">
                  {keyItem}
                </h3>
                {getActiveFiltersCount(keyItem) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {getActiveFiltersCount(keyItem)}
                  </Badge>
                )}
              </div>
              <div className="grid gap-3">
                {filterOptions[keyItem].map((option) => (
                  <Label
                    key={option.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="transition-all"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </div>
            </div>
            {index < Object.keys(filterOptions).length - 1 && <Separator />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
