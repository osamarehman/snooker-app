import { Match as PrismaMatch, Table } from "@prisma/client"

export interface Match extends PrismaMatch {
  table: Table;
  tableNumber?: number;
} 