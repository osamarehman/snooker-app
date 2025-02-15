import FinancialExport from "../components/FinancialExport"

export default function FinancialExportPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
      <div className="max-w-2xl">
        <FinancialExport />
      </div>
    </div>
  )
} 