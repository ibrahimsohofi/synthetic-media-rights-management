"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxDisplayed?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
  maxDisplayed = 5,
}: PaginationProps) {
  // Helper to create the array of page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxDisplayed) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // We need to calculate which page numbers to show
    // Always show the first and last, and some pages around the current page
    const midPoint = Math.floor(maxDisplayed / 2);

    if (currentPage <= midPoint + 1) {
      // If we're near the start, show first `maxDisplayed - 1` pages and the last page
      const pageNumbers = Array.from({ length: maxDisplayed - 1 }, (_, i) => i + 1);
      return [...pageNumbers, null, totalPages];
    } else if (currentPage >= totalPages - midPoint) {
      // If we're near the end, show the first page and last `maxDisplayed - 1` pages
      const pageNumbers = Array.from(
        { length: maxDisplayed - 1 },
        (_, i) => totalPages - (maxDisplayed - 2) + i
      );
      return [1, null, ...pageNumbers];
    } else {
      // If we're in the middle, show first, last, and pages around current
      const pagesToShow = maxDisplayed - 4; // Accounting for first, last, and two ellipses
      const start = currentPage - Math.floor(pagesToShow / 2);
      const end = start + pagesToShow - 1;
      const pageNumbers = Array.from(
        { length: pagesToShow },
        (_, i) => start + i
      );
      return [1, null, ...pageNumbers, null, totalPages];
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center gap-1">
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers && getPageNumbers().map((page, i) => (
        page === null ? (
          <div key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            &hellip;
          </div>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className="h-8 w-8"
            onClick={() => handlePageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      ))}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}

      <div className="ml-2 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
