import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  linesPerPage: number;
  totalLines: number;
  onPageChange: (page: number) => void;
  onLinesPerPageChange: (lines: number) => void;
}

export function PaginationControl({
  currentPage,
  totalPages,
  linesPerPage,
  totalLines,
  onPageChange,
  onLinesPerPageChange
}: PaginationControlProps) {
  const [jumpToPage, setJumpToPage] = useState('');
  const [jumpToLine, setJumpToLine] = useState('');

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
    }
  };

  const handleJumpToLine = () => {
    const line = parseInt(jumpToLine);
    if (line >= 1 && line <= totalLines) {
      const page = Math.ceil(line / linesPerPage);
      onPageChange(page);
      setJumpToLine('');
    }
  };

  const startLine = (currentPage - 1) * linesPerPage + 1;
  const endLine = Math.min(currentPage * linesPerPage, totalLines);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm text-slate-600 min-w-[200px] text-center">
          Page {currentPage} of {totalPages} ({startLine}-{endLine} of {totalLines} lines)
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Jump to page:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
            className="w-20 h-8"
            placeholder="Page"
          />
          <Button size="sm" onClick={handleJumpToPage}>Go</Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Jump to line:</span>
          <Input
            type="number"
            min="1"
            max={totalLines}
            value={jumpToLine}
            onChange={(e) => setJumpToLine(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumpToLine()}
            className="w-20 h-8"
            placeholder="Line"
          />
          <Button size="sm" onClick={handleJumpToLine}>Go</Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Lines/page:</span>
          <select
            value={linesPerPage}
            onChange={(e) => onLinesPerPageChange(parseInt(e.target.value))}
            className="h-8 px-2 rounded border border-slate-300 text-sm"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>
    </div>
  );
}
