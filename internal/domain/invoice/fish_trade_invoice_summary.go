package invoice

type FishTradeInvoiceSummary struct {
	Pending       int64 `json:"pending"`
	Paid          int64 `json:"paid"`
}
