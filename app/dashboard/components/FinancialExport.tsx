"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, Download, FileText, FileSpreadsheet } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import dayjs from 'dayjs'

type ExportType = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type FileFormat = 'csv' | 'pdf'

interface FinancialRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: string;
}

interface FilterOptions {
  tableNumber?: string;
  playerName?: string;
}

interface Match {
  id: string;
  loginTime: string;
  initialPrice: number;
  table: {
    tableNumber: number;
  };
  player1: string;
  player2: string;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  tag: string;
}

interface APIResponse {
  matches: Match[];
  expenses: Expense[];
}

export default function FinancialExport() {
  const [exportType, setExportType] = useState<ExportType>('all')
  const [fileFormat, setFileFormat] = useState<FileFormat>('csv')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = dayjs().endOf('day');
    const start = end.subtract(7, 'days').startOf('day');
    return {
      from: start.toDate(),
      to: end.toDate()
    };
  })
  const [filters, setFilters] = useState<FilterOptions>({})
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<FinancialRecord[]>([])

  const disabledDays = {
    after: new Date(),
  }

  // Function to adjust date range based on export type
  const adjustDateRange = useCallback((type: ExportType) => {
    const today = dayjs();
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs = today;

    switch (type) {
      case 'daily':
        start = today.startOf('day');
        end = today.endOf('day');
        break;
      case 'weekly':
        start = today.subtract(1, 'week').startOf('week');
        end = today;
        break;
      case 'monthly':
        start = today.subtract(1, 'month').startOf('month');
        end = today;
        break;
      case 'yearly':
        start = today.subtract(1, 'year').startOf('year');
        end = today;
        break;
      default:
        start = today.subtract(7, 'days');
        end = today;
    }

    return { from: start.toDate(), to: end.toDate() };
  }, []);

  // Handle export type change
  const handleExportTypeChange = (type: ExportType) => {
    setExportType(type);
    if (type !== 'all') {
      const newRange = adjustDateRange(type);
      setDateRange(newRange);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const fetchRecords = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    if (dayjs(dateRange.from).isAfter(dayjs()) || dayjs(dateRange.to).isAfter(dayjs())) {
      toast.error('Cannot fetch records for future dates');
      return;
    }

    if (dayjs(dateRange.from).isAfter(dateRange.to)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    
    try {
      const params = new URLSearchParams({
        startDate: dayjs(dateRange.from).format('YYYY-MM-DD'),
        endDate: dayjs(dateRange.to).format('YYYY-MM-DD'),
        ...(filters.tableNumber && { tableNumber: filters.tableNumber }),
        ...(filters.playerName && { playerName: filters.playerName })
      });

      console.log('Fetching records with params:', Object.fromEntries(params));
      const response = await fetch(`/api/financial/records?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      
      const data = await response.json() as APIResponse;
      console.log('Received data:', data);

      // Transform the data to match FinancialRecord interface
      const transformedRecords = [
        ...data.matches.map((match: Match) => ({
          id: match.id,
          date: match.loginTime,
          amount: match.initialPrice || 0,
          description: `Match: Table ${match.table.tableNumber} - ${match.player1} vs ${match.player2}`,
          type: 'income'
        })), 
        ...data.expenses.map((expense: Expense) => ({
          id: expense.id,
          date: expense.date,
          amount: -expense.amount,
          description: expense.description,
          type: 'expense'
        }))
      ];

      setRecords(transformedRecords);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to fetch records");
    }
  }, [dateRange, filters.tableNumber, filters.playerName]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      if (dayjs(dateRange.from).isAfter(dayjs()) || dayjs(dateRange.to).isAfter(dayjs())) {
        setDateRange({
          from: dayjs().subtract(7, 'days').toDate(),
          to: new Date()
        });
        toast.error('Future dates are not allowed. Date range has been reset.');
        return;
      }
      fetchRecords();
    }
  }, [dateRange, fetchRecords]);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    const today = dayjs().endOf('day');
    const fromDate = dayjs(range.from).startOf('day');
    const toDate = range.to ? dayjs(range.to).endOf('day') : fromDate;

    if (fromDate.isAfter(today)) {
      toast.error('Cannot select future dates');
      return;
    }

    if (toDate.isAfter(today)) {
      // If end date is in future, set it to today
      setDateRange({
        from: fromDate.toDate(),
        to: today.toDate()
      });
      return;
    }

    setDateRange({
      from: fromDate.toDate(),
      to: toDate.toDate()
    });
  };

  // Separate export function
  const handleExportData = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        startDate: dayjs(dateRange.from).format('YYYY-MM-DD'),
        endDate: dayjs(dateRange.to).format('YYYY-MM-DD'),
        fileType: fileFormat,
        ...(filters.tableNumber && { tableNumber: filters.tableNumber }),
        ...(filters.playerName && { playerName: filters.playerName })
      });

      const response = await fetch(`/api/export/financial?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${dayjs(dateRange.from).format('YYYY-MM-DD')}-to-${dayjs(dateRange.to).format('YYYY-MM-DD')}.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Data Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={exportType} onValueChange={handleExportTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="daily">Daily Report</SelectItem>
              <SelectItem value="weekly">Weekly Report</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
              <SelectItem value="yearly">Yearly Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Filter by Table (Optional)</Label>
            <Select 
              value={filters.tableNumber || "all"} 
              onValueChange={(value) => handleFilterChange('tableNumber', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    Table {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter by Player (Optional)</Label>
            <Select 
              value={filters.playerName || "all"} 
              onValueChange={(value) => handleFilterChange('playerName', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Players</SelectItem>
                <SelectItem value="player1">Player 1</SelectItem>
                <SelectItem value="player2">Player 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    <>
                      {dayjs(dateRange.from).format('MMM D, YYYY')} - {dateRange?.to ? dayjs(dateRange.to).format('MMM D, YYYY') : ''}
                    </>
                  ) : (
                    dayjs(dateRange.from).format('MMM D, YYYY')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={disabledDays}
                toDate={new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={fileFormat} onValueChange={(v) => setFileFormat(v as FileFormat)}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV Spreadsheet</span>
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF Document</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {records.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Financial Summary</h3>
              <p className="text-sm text-muted-foreground">
                Total Records: {records.length}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg font-semibold">
                  Rs {records
                    .filter(r => r.amount > 0)
                    .reduce((sum, r) => sum + r.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-semibold text-red-600">
                  Rs {Math.abs(records
                    .filter(r => r.amount < 0)
                    .reduce((sum, r) => sum + r.amount, 0))
                    .toFixed(2)}
                </p>
              </div>
            </div>

            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dayjs(record.date).format('MMM D, YYYY')}
                      </td>
                      <td className="px-6 py-4 text-sm">{record.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm text-right ${
                        record.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rs {Math.abs(record.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dateRange?.from && dateRange?.to && records.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No financial records found for the selected date range.
          </div>
        )}

        <Button 
          className="w-full mt-4"
          onClick={handleExportData}
          disabled={loading || !dateRange?.from || !dateRange?.to}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 