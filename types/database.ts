export interface Match {
  id: string
  tableId: string
  player1: string
  player2: string
  loginTime: string
  logoutTime: string | null
  format: 'PER_MINUTE' | 'PER_FRAME'
  frames?: number
  totalTime?: number
  initialPrice: number
  hasDiscount: boolean
  discount?: number
  finalPrice: number
  dueFees?: string
  paymentMethod: 'CASH' | 'CREDIT' | 'ONLINE'
  status: 'ONGOING' | 'COMPLETED'
  createdAt: string
  updatedAt: string
}

export type NewMatch = Omit<Match, 'id' | 'createdAt'> 