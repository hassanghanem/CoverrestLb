"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Slash } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Breadcrumbs() {
  const { t } = useTranslation();
  const items = useBreadcrumbs();
  if (items.length === 0) return null;

  const filteredItems = items.reduce((acc, item, index) => {
    if (!isNaN(Number(item.title))) return acc;
    if (index > 0 && item.title === items[index - 1].title) return acc;
    return [...acc, item];
  }, [] as typeof items);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {filteredItems.map((item, index) => {
          const isLast = index === filteredItems.length - 1;
          const translatedTitle = t(item.title);

          return (
            <Fragment key={item.title}>
              {!isLast ? (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <Link to={item.link}>{translatedTitle}</Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block">
                    <Slash />
                  </BreadcrumbSeparator>
                </>
              ) : (
                <BreadcrumbPage>{translatedTitle}</BreadcrumbPage>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
