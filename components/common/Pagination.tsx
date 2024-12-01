import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-3"
        variant={"outline"}
      >
        <div>
          <ChevronLeft className="w-4 h-4" />
        </div>
      </Button>

      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 text-sm rounded-md ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        variant={"outline"}
        className="p-3"
      >
        <div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Button>
    </div>
  );
}
