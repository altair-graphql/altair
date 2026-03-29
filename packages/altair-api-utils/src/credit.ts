export interface IBuyCreditDto {
  quantity?: number;
}

export interface ICreditTransaction {
  id: string;
  userId: string;
  monthlyAmount: number;
  fixedAmount: number;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreditTransactionsResponse {
  items: ICreditTransaction[];
  hasMore: boolean;
  nextCursor?: string;
}
