export interface TransactionChangeStatusBatchLogs {
    changeStatus:                        string;
    resumeTotalsByTransactionType:       ResumeTotalsByTransactionType[];
    transactionChangeStatusBatchLogsId?: string;
}

export interface ResumeTotalsByTransactionType {
    totalChangeStatusApproved:        number;
    totalChangeStatusRejected:        number;
    transactionsChangeStatusApproved: TransactionResume[];
    transactionsChangeStatusRejected: TransactionResume[];
    transactionType:                  string;
}

export interface TransactionResume {
    amountTransaction: number;
    transactionId:     string;
}
