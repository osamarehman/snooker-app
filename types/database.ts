export type Format = 'PER_MINUTE' | 'PER_FRAME'
export type PaymentMethod = 'CASH' | 'ONLINE' | 'CREDIT'
export type Status = 'ONGOING' | 'COMPLETED' | 'PENDING_PAYMENT'
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Table {
  id: string
  createdAt: Date
  updatedAt: Date
  tableNumber: number
}

export interface Match {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
  tableId: string
  tableNumber: number
  player1: string
  player2: string
  loginTime: Date | string
  logoutTime: Date | string | null
  format: Format
  frames: number | null
  timeMinutes?: number | null
  initialPrice: number | null
  discount: number | null
  hasDiscount: boolean
  finalPrice: number | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: Status
  table?: Table
}

export type NewMatch = Omit<Match, 'id' | 'createdAt'> 