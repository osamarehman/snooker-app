import { TableCard } from "@/components/TableCard"
import { initializeTables } from "@/app/actions/table"

export default async function Home() {
  // Initialize tables on page load
  await initializeTables(7)

  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <TableCard key={index} tableNumber={index + 1} />
        ))}
      </div>
    </main>
  )
}
