export interface Match {
  id: string
  createdAt: Date
  updatedAt: Date
  tableId: string
  player1: string
  player2: string
  loginTime: Date
  logoutTime: Date | null
  format: Format
  frames: number | null
  timeMinutes: number | null
  hasDiscount: boolean
  discount: number | null
  initialPrice: number
  finalPrice: number | null
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  status: Status
  table: Table
}

export type Format = "PER_MINUTE" | "PER_FRAME"
export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "CREDIT"
export type PaymentStatus = "PENDING" | "PAID"
export type Status = "ONGOING" | "COMPLETED" | "PENDING_PAYMENT"

export interface Table {
  id: string
  createdAt: Date
  updatedAt: Date
  tableNumber: number
}

export type NewMatch = Omit<Match, 'id' | 'createdAt'> 

type DateToString<T> = T extends Date ? string : T extends Date | null ? string | null : T;

export type IndexedDBMatch = {
  [K in keyof Match]: K extends 'table' 
    ? IndexedDBTable 
    : DateToString<Match[K]>
}

export type IndexedDBTable = {
  [K in keyof Table]: DateToString<Table[K]>
} 