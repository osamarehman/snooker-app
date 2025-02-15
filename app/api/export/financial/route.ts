import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import autoTable, { RowInput } from 'jspdf-autotable'
import { Match as PrismaMatch, Expense as PrismaExpense, Status } from '@prisma/client'
// Add required dayjs plugins
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Extend Prisma types with included relations
interface MatchWithTable extends PrismaMatch {
  table: {
    id: string;
    tableNumber: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

// // Add these interfaces at the top of the file
// interface Match {
//   id: string;
//   loginTime: string;
//   frames?: number;
//   timeMinutes?: number;
//   initialPrice?: number;
//   paymentMethod?: string;
//   hasDiscount?: boolean;
//   discount?: number;
//   table: {
//     tableNumber: number;
//   };
//   player1: string;
//   player2: string;
// }

// interface Expense {
//   id: string;
//   date: string;
//   description: string;
//   tag: string;
//   quantity: number;
//   rate: number;
//   amount: number;
// }

// Type for PDF document with AutoTable
interface PDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Helper functions to format data for tables
const formatMatchRow = (match: MatchWithTable): RowInput => {
  return [
    dayjs(match.loginTime).format('MMM D, YYYY HH:mm'),
    match.table.tableNumber,
    `${match.player1} vs ${match.player2}`,
    match.frames || 0,
    match.timeMinutes || 0,
    `Rs ${match.initialPrice || 0}`,
    match.paymentMethod || 'N/A',
    match.hasDiscount ? `${match.discount}%` : 'No'
  ]
};

const formatExpenseRow = (expense: PrismaExpense): RowInput => {
  return [
    dayjs(expense.date).format('MMM D, YYYY HH:mm'),
    expense.description,
    expense.tag,
    expense.quantity,
    `Rs ${expense.rate}`,
    `Rs ${expense.amount}`
  ]
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const fileType = searchParams.get('fileType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tableNumber = searchParams.get('tableNumber')
    const playerName = searchParams.get('playerName')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    const start = dayjs(startDate).startOf('day')
    const end = dayjs(endDate).endOf('day')

    // Get matches data with proper typing
    const matches = await prisma.match.findMany({
      where: {
        loginTime: {
          gte: start.toDate(),
          lte: end.toDate()
        },
        status: 'COMPLETED' as Status,
        ...(tableNumber && {
          table: {
            tableNumber: parseInt(tableNumber)
          }
        }),
        ...(playerName && {
          OR: [
            { player1: playerName },
            { player2: playerName }
          ]
        })
      },
      include: {
        table: true
      }
    }) as MatchWithTable[]

    // Get expenses data
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: start.toDate(),
          lte: end.toDate()
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate totals
    const matchesTotals = matches.reduce((acc, match) => ({
      frames: acc.frames + (match.frames || 0),
      time: acc.time + (match.timeMinutes || 0),
      revenue: acc.revenue + (match.initialPrice || 0)
    }), { frames: 0, time: 0, revenue: 0 })

    const expensesTotals = expenses.reduce((acc, expense) => ({
      total: acc.total + expense.amount
    }), { total: 0 })

    const netIncome = matchesTotals.revenue - expensesTotals.total

    if (fileType === 'pdf') {
      const doc = new jsPDF() as PDFWithAutoTable
      
      // Add title
      doc.setFontSize(16)
      doc.text('Financial Report', 14, 15)
      
      // Add report details
      doc.setFontSize(10)
      const reportDetails = [
        `Report Type: ${type?.charAt(0).toUpperCase()}${type?.slice(1) || ''}`,
        `Date Range: ${start.format('MMM D, YYYY')} to ${end.format('MMM D, YYYY')}`,
        `Total Matches: ${matches.length}`,
        `Total Expenses: ${expenses.length}`
      ]
      
      reportDetails.forEach((text, index) => {
        doc.text(text, 14, 25 + (index * 5))
      })

      // Add financial summary
      doc.setFontSize(12)
      doc.text('Financial Summary', 14, 50)
      
      const summaryData = [
        ['Total Revenue:', `Rs ${matchesTotals.revenue.toFixed(2)}`],
        ['Total Expenses:', `Rs ${expensesTotals.total.toFixed(2)}`],
        ['Net Income:', `Rs ${netIncome.toFixed(2)}`],
        ['Total Frames:', `${matchesTotals.frames}`],
        ['Total Time (minutes):', `${matchesTotals.time}`]
      ]
      
      autoTable(doc, {
        startY: 55,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 
          0: { cellWidth: 80 },
          1: { cellWidth: 60 }
        }
      })


      // Update matches table with proper typing
      if (matches.length > 0) {
        doc.setFontSize(12)
        doc.text('Matches', 14, doc.lastAutoTable.finalY + 10)
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Date', 'Table', 'Players', 'Frames', 'Time (min)', 'Amount', 'Payment', 'Discount']],
          body: matches.map(formatMatchRow),
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 8 }
        })
      }

      // Update expenses table with proper typing
      if (expenses.length > 0) {
        doc.setFontSize(12)
        doc.text('Expenses', 14, doc.lastAutoTable.finalY + 10)
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Date', 'Description', 'Category', 'Quantity', 'Rate', 'Amount']],
          body: expenses.map(formatExpenseRow),
          theme: 'striped',
          headStyles: { fillColor: [231, 76, 60] },
          styles: { fontSize: 8 }
        })
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${dayjs().format('MMM D, YYYY HH:mm')}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }

      const pdfBlob = doc.output('blob')
      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=financial-report-${start.format('YYYY-MM-DD')}.pdf`
        }
      })
    }

    // For CSV export
    if (fileType === 'csv') {
      const matchesData = matches.map(match => ({
        type: 'MATCH',
        date: dayjs(match.loginTime).format('MMM D, YYYY HH:mm'),
        description: `Table ${match.table.tableNumber} - ${match.player1} vs ${match.player2}`,
        frames: match.frames || 0,
        timeMinutes: match.timeMinutes || 0,
        amount: match.initialPrice || 0,
        paymentMethod: match.paymentMethod || 'N/A',
        discount: match.hasDiscount ? `${match.discount}%` : 'No'
      }))

      const expensesData = expenses.map(expense => ({
        type: 'EXPENSE',
        date: dayjs(expense.date).format('MMM D, YYYY HH:mm'),
        description: expense.description,
        category: expense.tag,
        quantity: expense.quantity,
        rate: expense.rate,
        amount: -expense.amount,
        paymentMethod: 'N/A',
        discount: 'N/A'
      }))

      const summaryData = [{
        type: 'SUMMARY',
        date: dayjs().format('MMM D, YYYY HH:mm'),
        description: 'Financial Summary',
        category: '',
        quantity: '',
        rate: '',
        amount: netIncome,
        totalRevenue: matchesTotals.revenue,
        totalExpenses: expensesTotals.total
      }]

      const allData = [...summaryData, ...matchesData, ...expensesData]

      const csvString = [
        Object.keys(allData[0]).join(','),
        ...allData.map(row => 
          Object.values(row)
            .map(value => `"${value}"`)
            .join(',')
        )
      ].join('\n')

      return new NextResponse(csvString, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=financial-report-${start.format('YYYY-MM-DD')}.csv`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ 
      error: 'Failed to export data. Please try again.' 
    }, { status: 500 })
  }
} 