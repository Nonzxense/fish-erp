package invoice

import "time"

type InvoiceFilter struct {
	ID       *string    `json:"id"`
	Type     *string    `json:"type"`
	Name     *string    `json:"name"`
	FromDate *time.Time `json:"fromDate"`
	ToDate   *time.Time `json:"toDate"`
	Page     int        `json:"page"`
	PageSize int        `json:"pageSize"`
}
