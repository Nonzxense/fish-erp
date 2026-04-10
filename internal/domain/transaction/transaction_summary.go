package transaction

type TransactionSummary struct {
	TotalIncome  float64 `json:"totalIncome"`
	TotalExpense float64 `json:"totalExpense"`
	Profit       float64 `json:"profit"`
}
